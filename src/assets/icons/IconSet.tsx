type IconlyIconProps = {
  size?: number;
  color?: string;
};

export const IconlyHome2 = ({
  size = 24,
  color = "currentColor",
}: IconlyIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.70642 21.3887H3.80664V8.88605L12.1508 2.88867L20.6937 8.88605V21.3887H14.8281"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
      ></path>
      <path
        opacity="0.4"
        d="M9.70642 21.3887V16.3098H14.8281V21.3887"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
      ></path>
    </svg>
  );
};

export const IconlySearch = ({
  size = 24,
  color = "currentColor",
}: IconlyIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Iconly/Two-tone/Search</title>
      <g
        id="Iconly/Two-tone/Search"
        stroke="none"
        strokeWidth="1.5"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g
          id="Search"
          transform="translate(2.000000, 2.000000)"
          stroke={color}
          strokeWidth="1.5"
        >
          <circle
            id="Ellipse_739"
            cx="9.76659044"
            cy="9.76659044"
            r="8.9885584"
          ></circle>
          <line
            x1="16.0183067"
            y1="16.4851259"
            x2="19.5423342"
            y2="20.0000001"
            id="Line_181"
            opacity="0.400000006"
          ></line>
        </g>
      </g>
    </svg>
  );
};

export const IconlyNotification = ({
  size = 24,
  color = "currentColor",
}: IconlyIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Iconly/Two-tone/Notification</title>
      <g
        id="Iconly/Two-tone/Notification"
        stroke="none"
        strokeWidth="1.5"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g
          id="Notification"
          transform="translate(3.500000, 2.000000)"
          stroke={color}
          strokeWidth="1.5"
        >
          <path
            d="M8.5,15.8476424 C14.13923,15.8476424 16.7480515,15.1242108 17,12.220506 C17,9.31879687 15.1811526,9.50539234 15.1811526,5.94511102 C15.1811526,3.16414015 12.5452291,-1.86517468e-14 8.5,-1.86517468e-14 C4.4547709,-1.86517468e-14 1.81884743,3.16414015 1.81884743,5.94511102 C1.81884743,9.50539234 0,9.31879687 0,12.220506 C0.252952291,15.135187 2.86177374,15.8476424 8.5,15.8476424 Z"
            id="Stroke-1"
          ></path>
          <path
            d="M10.8887931,18.8572176 C9.52465753,20.3719337 7.3966462,20.3898948 6.0194615,18.8572176"
            id="Stroke-3"
            opacity="0.400000006"
          ></path>
        </g>
      </g>
    </svg>
  );
};

export const IconlyMessage = ({
  size = 24,
  color = "currentColor",
}: IconlyIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Iconly/Light-Outline/Message</title>
      <g
        id="Iconly/Light-Outline/Message"
        stroke="none"
        strokeWidth="1.5"
        fill="none"
        fillRule="evenodd"
      >
        <g id="Message" transform="translate(1.000000, 1.000000)" fill={color}>
          <path
            d="M15.6589,1 C18.9889,1 21.4999,3.717 21.4999,7.32 L21.4999,14.188 C21.4999,16.032 20.8479,17.698 19.6629,18.88 C18.5999,19.939 17.2209,20.5 15.6749,20.5 L5.8219,20.5 C4.2789,20.5 2.9009,19.94 1.8369,18.88 C0.6519,17.698 -0.0001,16.032 -0.0001,14.188 L-0.0001,7.32 C-0.0001,3.717 2.5109,1 5.8409,1 L15.6589,1 Z M15.6589,2.5 L5.8409,2.5 C3.3259,2.5 1.4999,4.527 1.4999,7.32 L1.4999,14.188 C1.4999,15.631 1.9959,16.92 2.8959,17.817 C3.6719,18.592 4.6849,19 5.8249,19 L15.6589,19 C15.6609,18.998 15.6689,19 15.6749,19 C16.8159,19 17.8279,18.592 18.6039,17.817 C19.5049,16.92 19.9999,15.631 19.9999,14.188 L19.9999,7.32 C19.9999,4.527 18.1739,2.5 15.6589,2.5 Z M17.2349,7.1288 C17.4959,7.4498 17.4469,7.9218 17.1259,8.1838 L12.6819,11.7958 C12.1199,12.2418 11.4479,12.4648 10.7769,12.4648 C10.1079,12.4648 9.4409,12.2438 8.8829,11.8018 L4.3979,8.1858 C4.0749,7.9258 4.0249,7.4528 4.2839,7.1308 C4.5449,6.8098 5.0169,6.7588 5.3389,7.0178 L9.8199,10.6298 C10.3829,11.0758 11.1759,11.0758 11.7429,10.6258 L16.1789,7.0198 C16.5009,6.7568 16.9729,6.8068 17.2349,7.1288 Z"
            id="Combined-Shape"
          ></path>
        </g>
      </g>
    </svg>
  );
};

export const IconlyCategory = ({
  size = 24,
  color = "currentColor",
}: IconlyIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Iconly/Two-tone/Category</title>
      <g
        id="Iconly/Two-tone/Category"
        stroke="none"
        strokeWidth="1.5"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g
          id="Category"
          transform="translate(2.999141, 3.000000)"
          stroke={color}
          strokeWidth="1.5"
        >
          <path
            d="M0.000858865205,3.5 C0.000858865205,0.874787053 0.0289681101,0 3.50085887,0 C6.9727494,0 7.00085887,0.874787053 7.00085887,3.5 C7.00085887,6.12521295 7.01193168,7 3.50085887,7 C-0.010214169,7 0.000858865205,6.12521295 0.000858865205,3.5 Z"
            id="Stroke-1"
          ></path>
          <path
            d="M11.0008589,3.5 C11.0008589,0.874787053 11.0289681,0 14.5008589,0 C17.9727494,0 18.0008589,0.874787053 18.0008589,3.5 C18.0008589,6.12521295 18.0119317,7 14.5008589,7 C10.9897858,7 11.0008589,6.12521295 11.0008589,3.5 Z"
            id="Stroke-3"
            opacity="0.400000006"
          ></path>
          <path
            d="M0.000858865205,14.5 C0.000858865205,11.8747871 0.0289681101,11 3.50085887,11 C6.9727494,11 7.00085887,11.8747871 7.00085887,14.5 C7.00085887,17.1252129 7.01193168,18 3.50085887,18 C-0.010214169,18 0.000858865205,17.1252129 0.000858865205,14.5 Z"
            id="Stroke-5"
          ></path>
          <path
            d="M11.0008589,14.5 C11.0008589,11.8747871 11.0289681,11 14.5008589,11 C17.9727494,11 18.0008589,11.8747871 18.0008589,14.5 C18.0008589,17.1252129 18.0119317,18 14.5008589,18 C10.9897858,18 11.0008589,17.1252129 11.0008589,14.5 Z"
            id="Stroke-7"
          ></path>
        </g>
      </g>
    </svg>
  );
};
