"use client";

import { useEffect, useMemo, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import world from "world-atlas/countries-50m.json";

const WIDTH = 720;
const HEIGHT = 620;

const CX = WIDTH / 2;
const CY = HEIGHT / 2;

const GLOBE_RADIUS = 208;

const MODULES = [
  {
    title: "Research OS",
    desc: "Papers, drafts and citation graph.",
    href: "/research",
  },
  {
    title: "Security Lab",
    desc: "Interactive tools and threat intel.",
    href: "/security-lab",
  },
  {
    title: "Engineering OS",
    desc: "Projects, releases and deployments.",
    href: "/engineering",
  },
  {
    title: "Observatory",
    desc: "Live analytics and platform health.",
    href: "/observatory",
  },
];

const worldData = world as any;

const countries = feature(
  worldData,
  worldData.objects.countries
) as unknown as FeatureCollection<Geometry>;

const borders = mesh(
  worldData,
  worldData.objects.countries,
  (a: any, b: any) => a !== b
);

const graticule = geoGraticule()
  .step([15, 15])();

function OrbitRings({
  reduced,
}: {
  reduced: boolean;
}) {
  return (
    <g
      className={reduced ? "" : "hero-globe-orbits"}
      style={{
        transformOrigin: `${CX}px ${CY}px`,
      }}
    >
      {/* Main horizontal ring */}
      <ellipse
        cx={CX}
        cy={CY}
        rx={GLOBE_RADIUS + 88}
        ry={58}
        fill="none"
        stroke="var(--globe-dot)"
        strokeWidth="1"
        opacity="0.58"
      />

      {/* Upper diagonal ring */}
      <ellipse
        cx={CX}
        cy={CY}
        rx={GLOBE_RADIUS + 82}
        ry={62}
        fill="none"
        stroke="var(--globe-dot)"
        strokeWidth="0.9"
        opacity="0.40"
        transform={`rotate(31 ${CX} ${CY})`}
      />

      {/* Lower diagonal ring */}
      <ellipse
        cx={CX}
        cy={CY}
        rx={GLOBE_RADIUS + 82}
        ry={62}
        fill="none"
        stroke="var(--globe-dot)"
        strokeWidth="0.9"
        opacity="0.30"
        transform={`rotate(-31 ${CX} ${CY})`}
      />

      {/* Orbit particles */}
      <circle
        cx={CX + GLOBE_RADIUS + 88}
        cy={CY}
        r="4"
        fill="var(--globe-dot)"
        className="hero-globe-particle"
      />

      <circle
        cx={CX - GLOBE_RADIUS - 88}
        cy={CY}
        r="3"
        fill="var(--globe-dot)"
        className="hero-globe-particle"
      />

      <circle
        cx={CX + 28}
        cy={CY - 61}
        r="3"
        fill="var(--globe-dot)"
        className="hero-globe-particle"
      />

      <circle
        cx={CX - 78}
        cy={CY + 45}
        r="2.5"
        fill="var(--globe-dot)"
        className="hero-globe-particle"
      />
    </g>
  );
}

function Globe({
  rotation,
  reduced,
}: {
  rotation: number;
  reduced: boolean;
}) {
  const projection = useMemo(
    () =>
      geoOrthographic()
        .translate([CX, CY])
        .scale(GLOBE_RADIUS)
        .rotate([rotation, -8])
        .clipAngle(90),
    [rotation]
  );

  const path = useMemo(
    () => geoPath(projection),
    [projection]
  );

  const countryPaths = useMemo(
    () =>
      countries.features
        .map((country) => path(country as Feature))
        .filter((d): d is string => Boolean(d)),
    [path]
  );

  const borderPath = useMemo(
    () => path(borders),
    [path]
  );

  const graticulePath = useMemo(
    () => path(graticule),
    [path]
  );

  return (
    <>
      {/* Globe atmosphere */}
      <circle
        cx={CX}
        cy={CY}
        r={GLOBE_RADIUS + 3}
        fill="none"
        stroke="var(--globe-dot)"
        strokeWidth="2"
        opacity="0.32"
        className={reduced ? "" : "hero-globe-pulse"}
      />

      {/* Outer glow */}
      <circle
        cx={CX}
        cy={CY}
        r={GLOBE_RADIUS + 8}
        fill="none"
        stroke="var(--globe-dot)"
        strokeWidth="7"
        opacity="0.06"
        className={reduced ? "" : "hero-globe-pulse"}
      />

      {/* Globe surface */}
      <circle
        cx={CX}
        cy={CY}
        r={GLOBE_RADIUS}
        fill="url(#heroGlobeSurface)"
        stroke="var(--globe-dot)"
        strokeWidth="1.4"
        opacity="0.98"
      />

      {/* Latitude / longitude grid */}
      <path
        d={graticulePath ?? undefined}
        fill="none"
        stroke="var(--globe-dot)"
        strokeWidth="0.45"
        opacity="0.18"
      />

      {/* Country interiors */}
      {countryPaths.map((d, index) => (
        <path
          key={`country-${index}`}
          d={d}
          fill="var(--globe-lit)"
          fillOpacity="0.16"
          stroke="none"
        />
      ))}

      {/* Country borders */}
      <path
        d={borderPath ?? undefined}
        fill="none"
        stroke="var(--globe-dot)"
        strokeWidth="0.65"
        opacity="0.82"
      />

      {/* Land glow */}
      {countryPaths.map((d, index) => (
        <path
          key={`glow-${index}`}
          d={d}
          fill="none"
          stroke="var(--globe-dot)"
          strokeWidth="0.8"
          opacity="0.20"
        />
      ))}

      {/* Globe rim */}
      <circle
        cx={CX}
        cy={CY}
        r={GLOBE_RADIUS}
        fill="none"
        stroke="var(--globe-dot)"
        strokeWidth="1"
        opacity="0.65"
      />

      {/* Highlight */}
      <ellipse
        cx={CX - 58}
        cy={CY - 65}
        rx="92"
        ry="55"
        fill="var(--globe-lit)"
        opacity="0.055"
        transform={`rotate(-25 ${CX - 58} ${CY - 65})`}
      />
    </>
  );
}

export function HeroGlobe({
  countries: visitorCountries,
}: {
  countries?: number;
}) {
  const [reduced, setReduced] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const applyMotionSetting = () => {
      const stored =
        window.localStorage.getItem(
          "sr-os-reduced-motion"
        );

      setReduced(
        stored === "true" || mq.matches
      );
    };

    applyMotionSetting();

    const mediaHandler = () =>
      applyMotionSetting();

    const storageHandler = (event: StorageEvent) => {
      if (
        event.key ===
        "sr-os-reduced-motion"
      ) {
        applyMotionSetting();
      }
    };

    const motionHandler = () =>
      applyMotionSetting();

    mq.addEventListener(
      "change",
      mediaHandler
    );

    window.addEventListener(
      "storage",
      storageHandler
    );

    window.addEventListener(
      "sr-os-motion-change",
      motionHandler
    );

    return () => {
      mq.removeEventListener(
        "change",
        mediaHandler
      );

      window.removeEventListener(
        "storage",
        storageHandler
      );

      window.removeEventListener(
        "sr-os-motion-change",
        motionHandler
      );
    };
  }, []);

  useEffect(() => {
    if (reduced) return;

    const id = window.setInterval(() => {
      setRotation((current) =>
        (current + 0.35) % 360
      );
    }, 40);

    return () =>
      window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="
          w-full
          h-auto
          max-w-[1120px]
          overflow-visible
        "
        aria-hidden="true"
      >
        <defs>
          <radialGradient
            id="heroGlobeSurface"
            cx="35%"
            cy="28%"
            r="72%"
          >
            <stop
              offset="0%"
              stopColor="var(--globe-lit)"
              stopOpacity="0.72"
            />

            <stop
              offset="48%"
              stopColor="var(--globe-mid)"
              stopOpacity="0.42"
            />

            <stop
              offset="78%"
              stopColor="var(--globe-dark)"
              stopOpacity="0.82"
            />

            <stop
              offset="100%"
              stopColor="var(--globe-dark)"
              stopOpacity="1"
            />
          </radialGradient>

          <filter
            id="heroGlobeGlow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur
              stdDeviation="5"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="heroGlobeClip">
            <circle
              cx={CX}
              cy={CY}
              r={GLOBE_RADIUS}
            />
          </clipPath>
        </defs>

        {/* Orbit system */}
        <OrbitRings reduced={reduced} />

        {/* Globe */}
        <g filter="url(#heroGlobeGlow)">
          <Globe
            rotation={rotation}
            reduced={reduced}
          />
        </g>
      </svg>

      {visitorCountries !== undefined && (
        <p className="text-[12px] text-text-2 mt-1">
          {visitorCountries}{" "}
          {visitorCountries === 1
            ? "country"
            : "countries"}{" "}
          in visitor analytics — see{" "}
          <a
            href="/observatory"
            className="underline"
          >
            Observatory
          </a>
          .
        </p>
      )}

      <nav
        aria-label="Explore platform modules"
        className="w-full mt-4"
      >
        <ul className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          {MODULES.map((module) => (
            <li key={module.href}>
              <a
                href={module.href}
                className="
                  block
                  rounded-[10px]
                  border
                  border-border
                  bg-surface
                  px-3.5
                  py-3
                  hover:border-lavender
                  transition-colors
                  duration-fast
                "
              >
                <span className="block text-[12.5px] font-semibold text-text-1">
                  {module.title}
                </span>

                <span className="block text-[11.5px] text-text-2 mt-0.5">
                  {module.desc}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}