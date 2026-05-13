"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Camera,
  RefreshCw,
  X,
  Send,
  Zap,
  ZapOff,
  Video as VideoIcon,
  CameraIcon,
  Square,
  CloudUpload,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { getDeviceId } from "@/lib/fingerprint";
import {
  enqueue,
  flush,
  subscribe,
  pendingCount,
  type QueueEvent,
} from "@/lib/upload-queue";
import { registerServiceWorker, requestBackgroundSync } from "@/lib/sw-register";

export type CameraViewProps = {
  event: {
    id: string;
    title: string;
    photos_per_guest: number;
    videos_per_guest: number;
    videos_enabled: boolean;
    geofence_enabled?: boolean;
    venue_lat?: number | null;
    venue_lng?: number | null;
    venue_radius_m?: number | null;
  };
  guestName?: string;
};

type Facing = "user" | "environment";
type Mode = "photo" | "video";
type Phase = "live" | "preview" | "denied" | "blocked-geo";

const MAX_VIDEO_MS = 15_000;

export function CameraView({ event, guestName }: CameraViewProps) {
  const t = useTranslations("guest");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<BlobPart[]>([]);
  const recorderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [facing, setFacing] = useState<Facing>("environment");
  const [mode, setMode] = useState<Mode>("photo");
  const [phase, setPhase] = useState<Phase>("live");
  const [preview, setPreview] = useState<{
    blob: Blob;
    url: string;
    kind: "photo" | "video";
  } | null>(null);
  const [shots, setShots] = useState(() =>
    typeof window === "undefined"
      ? 0
      : Number(localStorage.getItem(`shots:${event.id}`) ?? 0),
  );
  const [videos, setVideos] = useState(() =>
    typeof window === "undefined"
      ? 0
      : Number(localStorage.getItem(`videos:${event.id}`) ?? 0),
  );
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(0);
  const [geoBlocked, setGeoBlocked] = useState<string | null>(null);

  const photosLeft = Math.max(0, event.photos_per_guest - shots);
  const videosLeft = Math.max(0, event.videos_per_guest - videos);
  const limitReached =
    mode === "photo" ? photosLeft === 0 : videosLeft === 0;

  // Online/offline + queue subscription + SW registration
  useEffect(() => {
    registerServiceWorker();
    void pendingCount().then(setPending);

    const updateNet = () => setOffline(!navigator.onLine);
    updateNet();
    window.addEventListener("online", updateNet);
    window.addEventListener("offline", updateNet);

    const unsub = subscribe((e: QueueEvent) => {
      setPending(e.remaining);
    });

    return () => {
      window.removeEventListener("online", updateNet);
      window.removeEventListener("offline", updateNet);
      unsub();
    };
  }, []);

  // Geofence check (best-effort, non-blocking on browsers that deny location)
  useEffect(() => {
    if (
      !event.geofence_enabled ||
      event.venue_lat == null ||
      event.venue_lng == null
    )
      return;
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = haversineMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          event.venue_lat!,
          event.venue_lng!,
        );
        const radius = event.venue_radius_m ?? 500;
        if (dist > radius + (pos.coords.accuracy ?? 0)) {
          setGeoBlocked(
            `Вы за пределами площадки (≈${Math.round(dist)} м). QR работает только на месте свадьбы.`,
          );
          setPhase("blocked-geo");
        }
      },
      () => {
        // Denied or unavailable — let server make the call instead
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, [event.geofence_enabled, event.venue_lat, event.venue_lng, event.venue_radius_m]);

  const startStream = useCallback(async () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: mode === "video",
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 2560 },
          height: { ideal: 1440 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const track = stream.getVideoTracks()[0];
      const caps = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & {
        torch?: boolean;
      };
      setTorchSupported(Boolean(caps.torch));
      setTorchOn(false);
    } catch (err) {
      console.error("[camera] getUserMedia failed", err);
      setPhase("denied");
    }
  }, [facing, mode]);

  useEffect(() => {
    if (phase === "live") void startStream();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [phase, startStream]);

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn }] as unknown as MediaTrackConstraintSet[],
      });
      setTorchOn((v) => !v);
    } catch (err) {
      console.error("[camera] torch failed", err);
    }
  }

  function flip() {
    setFacing((f) => (f === "user" ? "environment" : "user"));
  }

  async function capturePhoto() {
    if (limitReached) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.92),
    );
    if (!blob) return;
    setPreview({ blob, url: URL.createObjectURL(blob), kind: "photo" });
    setPhase("preview");
  }

  function startRecording() {
    if (limitReached || recording) return;
    const stream = streamRef.current;
    if (!stream) return;

    const mime = pickVideoMime();
    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 2_500_000,
    });
    recorderChunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recorderChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recorderChunksRef.current, { type: mime });
      setPreview({ blob, url: URL.createObjectURL(blob), kind: "video" });
      setPhase("preview");
      setRecording(false);
      setRecordSec(0);
      if (recorderTimerRef.current) clearInterval(recorderTimerRef.current);
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
    const startedAt = Date.now();
    recorderTimerRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt) / 1000);
      setRecordSec(sec);
      if (sec * 1000 >= MAX_VIDEO_MS) stopRecording();
    }, 200);
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  function retake() {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setPhase("live");
  }

  async function send() {
    if (!preview) return;
    const deviceId = await getDeviceId();

    let payload: Blob = preview.blob;
    if (preview.kind === "photo") {
      const file = new File([preview.blob], `shot-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      payload = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.85,
      });
    }

    await enqueue({
      eventId: event.id,
      deviceId,
      guestName,
      kind: preview.kind,
      file: payload,
    });
    await requestBackgroundSync();

    if (preview.kind === "photo") {
      const next = shots + 1;
      setShots(next);
      localStorage.setItem(`shots:${event.id}`, String(next));
    } else {
      const next = videos + 1;
      setVideos(next);
      localStorage.setItem(`videos:${event.id}`, String(next));
    }

    URL.revokeObjectURL(preview.url);
    setPreview(null);
    setPhase("live");
    void flush();
  }

  if (phase === "denied") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black p-6 text-center text-white">
        <div className="max-w-sm">
          <Camera className="mx-auto mb-4 h-10 w-10" />
          <h2 className="mb-2 text-xl">{t("permissionTitle")}</h2>
          <p className="text-sm text-white/70">{t("permissionDesc")}</p>
        </div>
      </div>
    );
  }

  if (phase === "blocked-geo") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black p-6 text-center text-white">
        <p className="max-w-sm">{geoBlocked}</p>
      </div>
    );
  }

  const counter =
    mode === "photo"
      ? limitReached
        ? t("shotsUsed")
        : t("shotsLeft", { count: photosLeft, total: event.photos_per_guest })
      : limitReached
        ? t("shotsUsed")
        : `🎬 ${videosLeft} / ${event.videos_per_guest}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)]">
        <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur">
          {counter}
        </div>
        <div className="flex items-center gap-2">
          {pending > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur">
              <CloudUpload className="h-3.5 w-3.5" />
              {pending}
            </div>
          )}
          {torchSupported && !recording && (
            <button
              onClick={toggleTorch}
              className="rounded-full bg-white/10 p-2.5 backdrop-blur"
              aria-label={t("torch")}
            >
              {torchOn ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Stage */}
      <div className="relative flex-1 overflow-hidden">
        {phase === "live" ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }}
          />
        ) : preview ? (
          preview.kind === "video" ? (
            <video
              src={preview.url}
              controls
              autoPlay
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.url}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
            />
          )
        ) : null}

        {recording && (
          <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-red-500 px-3 py-1.5 text-xs">
            ● REC {recordSec}s / {MAX_VIDEO_MS / 1000}s
          </div>
        )}
        {offline && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs">
            {t("offline")}
          </div>
        )}
      </div>

      {/* Mode toggle */}
      {phase === "live" && event.videos_enabled && !recording && (
        <div className="flex justify-center gap-2 pb-2">
          <button
            onClick={() => setMode("photo")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs ${
              mode === "photo" ? "bg-white text-black" : "bg-white/10 text-white"
            }`}
          >
            <CameraIcon className="h-3.5 w-3.5" /> Фото
          </button>
          <button
            onClick={() => setMode("video")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs ${
              mode === "video" ? "bg-white text-black" : "bg-white/10 text-white"
            }`}
          >
            <VideoIcon className="h-3.5 w-3.5" /> Видео
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-around gap-3 px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-4">
        {phase === "live" ? (
          <>
            <button
              onClick={flip}
              className="rounded-full bg-white/10 p-3 backdrop-blur disabled:opacity-30"
              aria-label={t("switchCamera")}
              disabled={recording}
            >
              <RefreshCw className="h-6 w-6" />
            </button>
            {mode === "photo" ? (
              <button
                onClick={capturePhoto}
                disabled={limitReached}
                aria-label="capture"
                className="relative h-20 w-20 rounded-full border-4 border-white/80 active:scale-95 disabled:opacity-30"
              >
                <span className="absolute inset-1.5 rounded-full bg-white" />
              </button>
            ) : recording ? (
              <button
                onClick={stopRecording}
                aria-label="stop"
                className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-red-500 active:scale-95"
              >
                <Square className="h-7 w-7 fill-red-500 text-red-500" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={limitReached}
                aria-label="record"
                className="relative h-20 w-20 rounded-full border-4 border-white/80 active:scale-95 disabled:opacity-30"
              >
                <span className="absolute inset-3 rounded-full bg-red-500" />
              </button>
            )}
            <div className="w-12" aria-hidden />
          </>
        ) : (
          <>
            <button
              onClick={retake}
              className="flex flex-col items-center gap-1 text-sm"
            >
              <span className="rounded-full bg-white/10 p-3 backdrop-blur">
                <X className="h-6 w-6" />
              </span>
              {t("retake")}
            </button>
            <button
              onClick={send}
              className="flex flex-col items-center gap-1 text-sm"
            >
              <span className="rounded-full bg-(--color-primary) p-3">
                <Send className="h-6 w-6" />
              </span>
              {t("send")}
            </button>
            <div className="w-12" aria-hidden />
          </>
        )}
      </div>
    </div>
  );
}

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function pickVideoMime() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=h264,aac",
    "video/mp4",
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c))
      return c;
  }
  return "video/webm";
}
