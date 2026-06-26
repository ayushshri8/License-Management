import { useState, useRef } from "react";

function Tooltip({ text, children, position = "bottom" }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const show = () => setVisible(true);
  const hide = () => { setVisible(false); clearTimeout(timerRef.current); };

  // Long-press for mobile
  const onTouchStart = () => { timerRef.current = setTimeout(() => setVisible(true), 500); };
  const onTouchEnd   = () => { clearTimeout(timerRef.current); setTimeout(hide, 1200); };

  return (
    <div
      className="tt-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {children}
      {visible && (
        <div className={`tt-box tt-${position}`}>
          {text}
          <div className={`tt-arrow tt-arrow-${position}`} />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
