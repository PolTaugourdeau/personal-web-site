// icons.jsx — minimal stroked icon set, monochrome, 16x16
const I = (props) => (size = 16) => ({ d, label }) => null; // not used; below are concrete components

const stroke = "currentColor";
const sw = 1.4;

function Ico({ size = 16, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

const IconHome = (p) => (<Ico {...p}><path d="M2.5 7.2 8 2.5l5.5 4.7V13a.5.5 0 0 1-.5.5H9.5V10h-3v3.5H3a.5.5 0 0 1-.5-.5V7.2Z"/></Ico>);
const IconChart = (p) => (<Ico {...p}><path d="M2 13h12"/><path d="M4 11V7"/><path d="M7.5 11V4.5"/><path d="M11 11V8.5"/></Ico>);
const IconChat  = (p) => (<Ico {...p}><path d="M2.5 4.5A1.5 1.5 0 0 1 4 3h8a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 12 11H6.5l-3 2.5V4.5Z"/></Ico>);
const IconSearch= (p) => (<Ico {...p}><circle cx="7.2" cy="7.2" r="3.7"/><path d="M10 10l3 3"/></Ico>);
const IconBell  = (p) => (<Ico {...p}><path d="M4.5 11h7l-1-1.5V7a2.5 2.5 0 0 0-5 0v2.5L4.5 11Z"/><path d="M6.8 13a1.2 1.2 0 0 0 2.4 0"/></Ico>);
const IconCog   = (p) => (<Ico {...p}><circle cx="8" cy="8" r="1.6"/><path d="M8 2.5v1.6M8 11.9v1.6M2.5 8h1.6M11.9 8h1.6M4.1 4.1l1.1 1.1M10.8 10.8l1.1 1.1M11.9 4.1l-1.1 1.1M5.2 10.8l-1.1 1.1"/></Ico>);
const IconStar  = (p) => (<Ico {...p}><path d="M8 2.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8L8 11.1 4.6 12.9l.7-3.8L2.5 6.5l3.8-.5L8 2.5Z"/></Ico>);
const IconCalendar=(p)=> (<Ico {...p}><rect x="2.5" y="3.5" width="11" height="9.5" rx="1.2"/><path d="M2.5 6.5h11M5.5 2.2v2.6M10.5 2.2v2.6"/></Ico>);
const IconNote  = (p) => (<Ico {...p}><rect x="3" y="2.5" width="10" height="11" rx="1.2"/><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3"/></Ico>);
const IconBookmark=(p)=>(<Ico {...p}><path d="M4 2.5h8v11l-4-2.5L4 13.5v-11Z"/></Ico>);
const IconPlus  = (p) => (<Ico {...p}><path d="M8 3v10M3 8h10"/></Ico>);
const IconChevL = (p) => (<Ico {...p}><path d="M9.5 4 5.5 8l4 4"/></Ico>);
const IconChevR = (p) => (<Ico {...p}><path d="M6.5 4 10.5 8l-4 4"/></Ico>);
const IconSend  = (p) => (<Ico {...p}><path d="M2.5 8 13.5 3l-2 10-3.5-3-1.5 3-1-4.5L2.5 8Z"/></Ico>);
const IconLogout= (p) => (<Ico {...p}><path d="M9.5 3.5h-5A1 1 0 0 0 3.5 4.5v7a1 1 0 0 0 1 1h5"/><path d="m11 6 2.5 2L11 10M13.5 8H6.5"/></Ico>);
const IconArrow = (p) => (<Ico {...p}><path d="M3.5 8h9M9 4.5l3.5 3.5L9 11.5"/></Ico>);
const IconSparkles=(p)=>(<Ico {...p}><path d="M5 2.5v3M5 9.5v3M2 6.5h3M8 6.5h-3"/><path d="M11 8.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7L11 8.5Z"/></Ico>);
const IconLink  = (p) => (<Ico {...p}><path d="M6.5 9.5 9.5 6.5"/><path d="M9 4.5l.5-.5a2.1 2.1 0 0 1 3 3l-1 1"/><path d="M7 11.5l-.5.5a2.1 2.1 0 0 1-3-3l1-1"/></Ico>);
const IconClock = (p) => (<Ico {...p}><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></Ico>);
const IconFilm  = (p) => (<Ico {...p}><rect x="2.5" y="3" width="11" height="10" rx="1"/><path d="M2.5 6.2h11M2.5 9.8h11M5.2 3v10M10.8 3v10"/></Ico>);
const IconEdit  = (p) => (<Ico {...p}><path d="M3 13h2.5L12 6.5 9.5 4 3 10.5V13Z"/><path d="M9.5 4l1.2-1.2a1 1 0 0 1 1.4 0l1.1 1.1a1 1 0 0 1 0 1.4L12 6.5"/></Ico>);
const IconTrash = (p) => (<Ico {...p}><path d="M3 5h10M6 5V3.5h4V5M4.5 5l.7 8.5h5.6L11.5 5"/></Ico>);
const IconClose = (p) => (<Ico {...p}><path d="M4 4l8 8M12 4l-8 8"/></Ico>);
const IconPlay  = (p) => (<Ico {...p}><path d="M5 3.5l7 4.5-7 4.5v-9Z"/></Ico>);

Object.assign(window, {
  IconHome, IconChart, IconChat, IconSearch, IconBell, IconCog,
  IconStar, IconCalendar, IconNote, IconBookmark, IconPlus,
  IconChevL, IconChevR, IconSend, IconLogout, IconArrow, IconSparkles,
  IconLink, IconClock, IconFilm, IconEdit, IconTrash, IconClose, IconPlay,
});
