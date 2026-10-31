
import { useEffect, useRef, useState, useCallback } from 'react';
import { readJson, writeJson } from '../utils/storage.js';

export const useScreenRecorder = (enabled, employee) => {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startedAtRef = useRef(null);
  const startingRef = useRef(false);

  const [active, setActive] = useState(false);
  const [recordings, setRecordings] = useState(() =>
    readJson('bank_local_recordings', [])
  );

  useEffect(() => {
    writeJson('bank_local_recordings', recordings);
  }, [recordings]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    startingRef.current = false;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    // Recording is allowed only for an authenticated employee.
    if (
      !enabled ||
      !employee ||
      !employee.employeeId ||
      active ||
      startingRef.current ||
      !navigator.mediaDevices?.getDisplayMedia
    ) {
      return false;
    }

    startingRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      chunksRef.current = [];
      startedAtRef.current = new Date().toISOString();

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, {
            type: 'video/webm'
          });

          const url = URL.createObjectURL(blob);

          setRecordings((current) => [
            {
              id: crypto.randomUUID(),
              employeeName: employee?.name || 'Unknown',
              employeeId: employee?.employeeId || '',
              startTime: startedAtRef.current,
              endTime: new Date().toISOString(),
              fileUrl: url,
              status: 'Stopped'
            },
            ...current
          ].slice(0, 20));
        }

        stream.getTracks().forEach((track) => track.stop());

        if (streamRef.current === stream) {
          streamRef.current = null;
        }

        recorderRef.current = null;
        startingRef.current = false;
        setActive(false);
      };

      // Stop the recording if the user ends screen sharing in Chrome.
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      });

      recorderRef.current = recorder;
      recorder.start(1000);

      setActive(true);
      startingRef.current = false;

      return true;
    } catch (error) {
      console.error('Screen recording could not start:', error);

      startingRef.current = false;
      setActive(false);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      return false;
    }
  }, [enabled, employee, active]);

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null;
        recorder.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());

      recorderRef.current = null;
      streamRef.current = null;
      startingRef.current = false;
    };
  }, []);

  return {
    active,
    start,
    stop,
    recordings,
    setRecordings
  };
};
