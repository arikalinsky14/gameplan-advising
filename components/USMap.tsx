"use client";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// Public-domain us-atlas TopoJSON, states-only, hosted on jsDelivr.
const US_STATES_TOPOJSON = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function USMap({
  lat,
  lng,
  color = "var(--accent)",
  label,
}: {
  lat: number;
  lng: number;
  color?: string;
  label?: string;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 900 }}
        width={800}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={US_STATES_TOPOJSON}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: "var(--mist)",
                    stroke: "var(--line)",
                    strokeWidth: 0.5,
                    outline: "none",
                  },
                  hover: {
                    fill: "var(--mist)",
                    stroke: "var(--line)",
                    strokeWidth: 0.5,
                    outline: "none",
                  },
                  pressed: {
                    fill: "var(--mist)",
                    stroke: "var(--line)",
                    strokeWidth: 0.5,
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>

        <Marker coordinates={[lng, lat]}>
          {/* Halo pulse */}
          <circle r={14} fill={color} opacity={0.15}>
            <animate attributeName="r" from="10" to="22" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.35" to="0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          {/* Solid dot */}
          <circle r={5} fill={color} stroke="var(--paper)" strokeWidth={1.5} />
          {label && (
            <text
              x={0}
              y={-14}
              textAnchor="middle"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fill: "var(--ink)",
              }}
            >
              {label}
            </text>
          )}
        </Marker>
      </ComposableMap>
    </div>
  );
}
