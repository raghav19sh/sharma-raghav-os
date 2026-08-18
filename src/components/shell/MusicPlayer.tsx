"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";

import {
  Music2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type Song = {
  title: string;
  artist: string;
  src: string;
};

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [songs, setSongs] = useState<Song[]>([]);
  const [songIndex, setSongIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);

  const [miniPosition, setMiniPosition] = useState({
    x: 0,
    y: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  const dragStart = useRef({
    x: 0,
    y: 0,
  });

  const hasDragged = useRef(false);

  /*
   * Load all music files automatically.
   */
  useEffect(() => {
    async function loadSongs() {
      try {
        const response = await fetch("/api/music");

        if (!response.ok) {
          return;
        }

        const data: Song[] = await response.json();

        setSongs(data);
      } catch {
        setSongs([]);
      }
    }

    loadSongs();
  }, []);

  /*
   * Initial mini-player position.
   */
  useEffect(() => {
    setMiniPosition({
      x: window.innerWidth - 80,
      y: window.innerHeight - 100,
    });
  }, []);

  /*
   * Keep volume synchronized.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  /*
   * Reset track state when song changes.
   */
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [songIndex]);

  /*
   * Play / pause.
   */
  async function togglePlay() {
    const audio = audioRef.current;

    if (!audio || !songs.length) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  /*
   * Previous song.
   */
  function previousSong() {
    if (!songs.length) return;

    setSongIndex((current) =>
      current === 0
        ? songs.length - 1
        : current - 1
    );

    setIsPlaying(false);
  }

  /*
   * Next song.
   */
  function nextSong() {
    if (!songs.length) return;

    setSongIndex((current) =>
      current === songs.length - 1
        ? 0
        : current + 1
    );

    setIsPlaying(false);
  }

  /*
   * Rewind / forward.
   */
  function skip(seconds: number) {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration)) {
      return;
    }

    const nextTime = Math.max(
      0,
      Math.min(
        audio.currentTime + seconds,
        audio.duration
      )
    );

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  /*
   * Seek.
   */
  function handleSeek(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const audio = audioRef.current;

    if (!audio) return;

    const nextTime = Number(event.target.value);

    if (!Number.isFinite(nextTime)) return;

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  /*
   * Volume.
   */
  function handleVolume(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const audio = audioRef.current;

    if (!audio) return;

    const nextVolume = Number(event.target.value);

    audio.volume = nextVolume;
    audio.muted = false;

    setVolume(nextVolume);
    setIsMuted(false);
  }

  /*
   * Mute.
   */
  function toggleMute() {
    const audio = audioRef.current;

    if (!audio) return;

    const nextMuted = !audio.muted;

    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  }

  /*
   * Format time.
   */
  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${minutes}:${remaining
      .toString()
      .padStart(2, "0")}`;
  }

  /*
   * Start dragging mini player.
   */
  function handleMiniPointerDown(
    event: PointerEvent<HTMLButtonElement>
  ) {
    event.preventDefault();

    const rect =
      event.currentTarget.getBoundingClientRect();

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    hasDragged.current = false;

    setIsDragging(true);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  /*
   * Drag mini player.
   */
  function handleMiniPointerMove(
    event: PointerEvent<HTMLButtonElement>
  ) {
    if (!isDragging) return;

    const distance = Math.sqrt(
      Math.pow(
        event.clientX - dragStart.current.x,
        2
      ) +
        Math.pow(
          event.clientY - dragStart.current.y,
          2
        )
    );

    if (distance > 6) {
      hasDragged.current = true;
    }

    const buttonSize = 52;

    const nextX = Math.max(
      8,
      Math.min(
        event.clientX - dragOffset.current.x,
        window.innerWidth - buttonSize - 8
      )
    );

    const nextY = Math.max(
      8,
      Math.min(
        event.clientY - dragOffset.current.y,
        window.innerHeight - buttonSize - 8
      )
    );

    setMiniPosition({
      x: nextX,
      y: nextY,
    });
  }

  /*
   * Stop dragging.
   */
  function handleMiniPointerUp(
    event: PointerEvent<HTMLButtonElement>
  ) {
    setIsDragging(false);

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture may already be released.
    }
  }

  const currentSong = songs[songIndex];

  /*
   * No songs found.
   */
  if (!songs.length) {
    return null;
  }

  /*
   * MINI PLAYER
   */
  if (!isOpen) {
    return (
      <>
        <audio
          ref={audioRef}
          src={currentSong?.src ?? ""}
          preload="auto"
          loop={false}
          onLoadedMetadata={(event) => {
            const audio = event.currentTarget;

            if (Number.isFinite(audio.duration)) {
              setDuration(audio.duration);
            }

            audio.volume = volume;
          }}
          onDurationChange={(event) => {
            const audio = event.currentTarget;

            if (Number.isFinite(audio.duration)) {
              setDuration(audio.duration);
            }
          }}
          onTimeUpdate={(event) => {
            setCurrentTime(
              event.currentTarget.currentTime
            );
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={nextSong}
        />

        <button
          type="button"
          onPointerDown={handleMiniPointerDown}
          onPointerMove={handleMiniPointerMove}
          onPointerUp={handleMiniPointerUp}
          onDoubleClick={() => setIsOpen(true)}
          aria-label="Music player"
          className="
            fixed
            z-[9999]
            flex
            h-[52px]
            w-[52px]
            items-center
            justify-center
            rounded-full
            border
            border-[var(--border)]
            bg-[var(--surface)]
            text-[var(--text-1)]
            shadow-[var(--shadow-lg)]
            backdrop-blur-xl
            select-none
            touch-none
            transition
            hover:scale-110
            active:scale-95
          "
          style={{
            left: `${miniPosition.x}px`,
            top: `${miniPosition.y}px`,
            cursor: isDragging
              ? "grabbing"
              : "grab",
          }}
        >
          <Music2
            size={20}
            className={
              isPlaying
                ? "animate-pulse"
                : ""
            }
          />

          {isPlaying && (
            <span
              className="
                absolute
                right-0
                top-0
                h-2.5
                w-2.5
                rounded-full
                bg-[var(--lavender)]
              "
            />
          )}
        </button>
      </>
    );
  }

  /*
   * FULL PLAYER
   */
  return (
    <>
      <audio
        ref={audioRef}
        src={currentSong?.src ?? ""}
        preload="auto"
        loop={false}
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget;

          if (Number.isFinite(audio.duration)) {
            setDuration(audio.duration);
          }

          audio.volume = volume;
        }}
        onDurationChange={(event) => {
          const audio = event.currentTarget;

          if (Number.isFinite(audio.duration)) {
            setDuration(audio.duration);
          }
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(
            event.currentTarget.currentTime
          );
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={nextSong}
      />

      <div
        className="
          fixed
          bottom-5
          right-5
          z-[9999]
          w-[310px]
          max-w-[calc(100vw-32px)]
          rounded-2xl
          border
          border-[var(--border)]
          bg-[var(--surface)]/95
          p-5
          text-[var(--text-1)]
          shadow-[var(--shadow-lg)]
          backdrop-blur-xl
        "
      >
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-[var(--lavender-tint)]
                text-[var(--lavender-text)]
              "
            >
              <Music2 size={17} />
            </div>

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[var(--text-2)]
              "
            >
              Now Playing
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Minimize music player"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-[var(--text-2)]
              transition
              hover:bg-[var(--lavender-tint)]
              hover:text-[var(--text-1)]
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* TRACK */}

        <div className="mt-5">
          <div
            className="
              truncate
              text-lg
              font-semibold
              text-[var(--text-1)]
            "
          >
            {currentSong?.title ?? "Soundtrack"}
          </div>

          <div
            className="
              mt-1
              text-sm
              text-[var(--text-2)]
            "
          >
            Raghav
          </div>
        </div>

        {/* PROGRESS */}

        <div className="mt-6">
          <input
            type="range"
            min="0"
            max={duration > 0 ? duration : 1}
            step="0.01"
            value={Math.min(
              currentTime,
              duration || 1
            )}
            onChange={handleSeek}
            aria-label="Music progress"
            className="
              h-2
              w-full
              cursor-pointer
              accent-[var(--lavender)]
            "
          />

          <div
            className="
              mt-2
              flex
              justify-between
              text-[10px]
              text-[var(--text-2)]
            "
          >
            <span>
              {formatTime(currentTime)}
            </span>

            <span>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* CONTROLS */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-7
          "
        >
          <button
            type="button"
            onClick={previousSong}
            aria-label="Previous song"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-[var(--text-2)]
              transition
              hover:bg-[var(--lavender-tint)]
              hover:text-[var(--text-1)]
            "
          >
            <RotateCcw size={19} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              isPlaying
                ? "Pause music"
                : "Play music"
            }
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-xl
              bg-[var(--lavender)]
              text-[var(--on-lavender)]
              shadow-sm
              transition
              hover:scale-105
              active:scale-95
            "
          >
            {isPlaying ? (
              <Pause size={23} />
            ) : (
              <Play size={23} />
            )}
          </button>

          <button
            type="button"
            onClick={nextSong}
            aria-label="Next song"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-[var(--text-2)]
              transition
              hover:bg-[var(--lavender-tint)]
              hover:text-[var(--text-1)]
            "
          >
            <RotateCw size={19} />
          </button>
        </div>

        {/* VOLUME */}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={
              isMuted
                ? "Unmute music"
                : "Mute music"
            }
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              text-[var(--text-2)]
              transition
              hover:text-[var(--text-1)]
            "
          >
            {isMuted ? (
              <VolumeX size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            aria-label="Volume"
            className="
              h-1
              flex-1
              cursor-pointer
              accent-[var(--lavender)]
            "
          />
        </div>
      </div>
    </>
  );
}
