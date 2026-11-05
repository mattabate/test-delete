export function Readout({ items }) {
  return (
    <div className="ana-readout-row">
      {items.map((item) => (
        <div key={item.label} className="ana-readout">
          <div className="ana-readout__label">{item.label}</div>
          <div className="ana-readout__value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
