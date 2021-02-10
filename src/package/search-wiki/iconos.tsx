import * as React from 'react';

export const IconoSpinner = ({
  style = {},
  fill = "black",
  viewBox = "0 0 38 38",
  width = "28",
  className = "",
  height = "28"
}) => {
  return (
    <svg
      width={width}
      style={style}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2" stroke={fill} >
          <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="1s"
              repeatCount="indefinite" />
          </path>
        </g>
      </g>
    </svg>
  );
}

export const ChevronRight = ({
  fill = "none",
  viewBox = "0 0 24 24",
  width = "28",
  height = "28",
  stroke = "#000",
  strokeWidth = "1",
  style={},
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fill}
      style={style}
      stroke={stroke}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export const ChevronLeft = ({
  fill = "none",
  viewBox = "0 0 24 24",
  width = "28",
  height = "28",
  stroke = "#000",
  strokeWidth = "1"
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
