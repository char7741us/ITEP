"use client";

import type { PetAccessory, PetColor } from "@/lib/learning/model";

const palettes = {
  mint: { body: "#c9e4cf", ear: "#7da991" },
  rose: { body: "#f4c6d2", ear: "#c57e99" },
  lavender: { body: "#dcd3f1", ear: "#9b8ab7" },
};

/** Code-native artwork keeps the companion crisp, light and responsive to progress. */
export function StudyPet({
  color = "mint",
  accessory = "none",
  happy = false,
  className = "",
}: {
  color?: PetColor;
  accessory?: PetAccessory;
  happy?: boolean;
  className?: string;
}) {
  const palette = palettes[color];
  return (
    <svg
      viewBox="0 0 260 230"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="132" cy="208" rx="82" ry="12" fill="#7a1f35" opacity=".08" />
      <g className="pet-float">
        <path
          className="pet-leaf"
          d="M129 68C97 47 95 21 99 15c28 6 38 24 30 53Z"
          fill={palette.ear}
        />
        <path
          d="M131 69c-2-28 11-41 34-44 3 22-11 40-34 44Z"
          fill={palette.body}
          stroke={palette.ear}
          strokeWidth="3"
        />
        <path
          d="M187 140c33-11 50 8 43 26-5 13-19 12-32 2"
          fill={palette.body}
          stroke={palette.ear}
          strokeWidth="3"
        />
        <path
          d="M61 133c-8-54 23-75 69-75s78 24 74 75l-4 39c-2 25-24 35-70 35s-67-10-69-35Z"
          fill={palette.body}
          stroke={palette.ear}
          strokeWidth="3"
        />
        <ellipse cx="78" cy="150" rx="13" ry="7" fill="#eb9fb3" opacity=".75" />
        <ellipse
          cx="181"
          cy="150"
          rx="13"
          ry="7"
          fill="#eb9fb3"
          opacity=".75"
        />
        {happy ? (
          <g stroke="#593441" strokeWidth="4" strokeLinecap="round">
            <path d="m93 132 7-6 7 6" />
            <path d="m153 132 7-6 7 6" />
          </g>
        ) : (
          <g className="pet-blink" fill="#593441">
            <ellipse cx="101" cy="131" rx="5" ry="8" />
            <ellipse cx="159" cy="131" rx="5" ry="8" />
          </g>
        )}
        <path
          d="M121 148q9 13 18 0"
          stroke="#593441"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M83 177c-16-11-24-3-19 11 4 10 18 11 24 3M173 177c16-11 24-3 19 11-4 10-18 11-24 3"
          fill={palette.body}
          stroke={palette.ear}
          strokeWidth="3"
        />
        <path
          d="m91 182 39 8 39-8v29l-39 8-39-8Z"
          fill="#fff9e9"
          stroke="#9a6d62"
          strokeWidth="2"
        />
        <path d="M130 190v29" stroke="#9a6d62" strokeWidth="2" />
        <path
          d="m100 193 20 4m-20 4 20 4m20-8 20-4m-20 12 20-4"
          stroke="#d5b799"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {accessory === "star" && (
          <path
            d="m181 68 4 10 11 1-9 7 3 11-9-6-9 6 3-11-9-7 11-1Z"
            fill="#f2d86a"
            stroke="#c29b45"
            strokeWidth="2"
          />
        )}
        {accessory === "flower" && (
          <g fill="#f2b6c6" stroke="#bf7592" strokeWidth="1.5">
            <circle cx="183" cy="73" r="8" />
            <circle cx="174" cy="82" r="8" />
            <circle cx="179" cy="94" r="8" />
            <circle cx="191" cy="94" r="8" />
            <circle cx="195" cy="81" r="8" />
            <circle cx="184" cy="84" r="6" fill="#f2d86a" />
          </g>
        )}
        {accessory === "scholar" && (
          <g>
            <path d="m73 66 58-22 59 22-59 21Z" fill="#7a1f35" />
            <path d="M100 77v18q30 13 61 0V77" fill="#905366" />
            <path d="M184 68v29" stroke="#f2d86a" strokeWidth="3" />
            <circle cx="184" cy="100" r="4" fill="#f2d86a" />
          </g>
        )}
      </g>
      <g className="pet-sparkle" fill="#d2a844">
        <path d="m43 93 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
        <path d="m218 68 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" />
      </g>
      {happy && (
        <g fill="#c66588" className="pet-hearts">
          <path d="M52 63c-16-14-24 6 0 18 24-12 16-32 0-18ZM214 113c-12-11-18 5 0 14 18-9 12-25 0-14Z" />
        </g>
      )}
    </svg>
  );
}
