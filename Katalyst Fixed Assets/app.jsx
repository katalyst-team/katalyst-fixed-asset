/* eslint-disable */
/* ============================================================
   KATALYST FIXED ASSETS — CONTROL CENTER
   Modular clickable prototype · React + dark industrial theme
   Structure:
     1. Icons
     2. Atoms (Stat, Meter, Avatar, EmptyState)
     3. Mock data (ASSETS, LOCATIONS, etc.)
     4. Sidebar nav + AppShell (Topbar + Sidebar)
     5. Pages (Dashboard, Register, Detail, ScanIn, ScanOut,
              Transfer, Audit, Maintenance, MasterData)
     6. App router + Toast system
============================================================ */

const { useState, useEffect, useMemo, useRef, createContext, useContext } = React;

/* Persist demo-created rows (disposals, loans, reservations, transfers) across refreshes */
const usePersisted = (key, initial) => {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch(e){ return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }, [key, val]);
  return [val, setVal];
};

/* ============================================================
   1. ICONS
============================================================ */
const Icon = ({n, s=14, c}) => {
  const p = { width:s, height:s, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:1.75, strokeLinecap:"round", strokeLinejoin:"round", className:c };
  switch(n){
    case 'dash':    return <svg {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
    case 'box':     return <svg {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8 12 13 21 8M12 13v8"/></svg>;
    case 'user':    return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case 'users':   return <svg {...p}><circle cx="9" cy="8" r="4"/><path d="M3 21a6 6 0 0 1 12 0M16 4a4 4 0 0 1 0 8M21 21a5 5 0 0 0-3-4.6"/></svg>;
    case 'pin':     return <svg {...p}><path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'arrin':   return <svg {...p}><path d="M20 12H4m6 6-6-6 6-6"/></svg>;
    case 'arrout':  return <svg {...p}><path d="M4 12h16m-6-6 6 6-6 6"/></svg>;
    case 'swap':    return <svg {...p}><path d="M7 3v18m0-18 4 4M7 3 3 7m14 14V3m0 18 4-4m-4 4-4-4"/></svg>;
    case 'audit':   return <svg {...p}><path d="M9 11h6M9 15h4M9 7h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>;
    case 'wrench':  return <svg {...p}><path d="M14 7a4 4 0 1 0 4 4l4-4-3-3-4 4a4 4 0 0 0-1-1zm-4 5L4 18a2 2 0 1 0 2 2l6-6"/></svg>;
    case 'db':      return <svg {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6a9 3 0 0 0 18 0V5M3 11v6a9 3 0 0 0 18 0v-6"/></svg>;
    case 'radar':   return <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 3v3"/></svg>;
    case 'shield':  return <svg {...p}><path d="M12 3 4 6v6c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>;
    case 'cog':     return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1c0 .7.4 1.3 1 1.5"/></svg>;
    case 'bell':    return <svg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/></svg>;
    case 'search':  return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
    case 'plus':    return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'chev':    return <svg {...p}><path d="m9 6 6 6-6 6"/></svg>;
    case 'chevd':   return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>;
    case 'check':   return <svg {...p}><path d="m5 12 5 5L20 7"/></svg>;
    case 'x':       return <svg {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'alert':   return <svg {...p}><path d="M12 3 2 21h20zM12 10v5M12 18.5v.5"/></svg>;
    case 'clock':   return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'cal':     return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>;
    case 'dl':      return <svg {...p}><path d="M12 3v12m-4-4 4 4 4-4M4 21h16"/></svg>;
    case 'up':      return <svg {...p}><path d="M12 21V9m-4 4 4-4 4 4M4 3h16"/></svg>;
    case 'filter':  return <svg {...p}><path d="M3 4h18l-7 9v6l-4-2v-4z"/></svg>;
    case 'refresh': return <svg {...p}><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/></svg>;
    case 'laptop':  return <svg {...p}><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M2 20h20M9 16l-1 4M15 16l1 4"/></svg>;
    case 'chair':   return <svg {...p}><path d="M6 6V2h12v4M5 6h14v6H5zM7 12v9M17 12v9M5 16h14"/></svg>;
    case 'truck':   return <svg {...p}><rect x="2" y="8" width="11" height="9"/><path d="M13 11h5l3 4v2h-8M5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>;
    case 'flask':   return <svg {...p}><path d="M10 2v6L4 20a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-12V2M8 2h8M8 14h8"/></svg>;
    case 'cross':   return <svg {...p}><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>;
    case 'qr':      return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM21 14v3h-3M14 21h3"/></svg>;
    case 'building':return <svg {...p}><rect x="3" y="3" width="18" height="18"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1M3 21h18"/></svg>;
    case 'dollar':  return <svg {...p}><path d="M12 2v20M17 5H9a3.5 3.5 0 0 0 0 7h6a3.5 3.5 0 0 1 0 7H7"/></svg>;
    case 'tag':     return <svg {...p}><path d="M20 12 12 20l-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>;
    case 'eye':     return <svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'arrowl':  return <svg {...p}><path d="M19 12H5m6-6-6 6 6 6"/></svg>;
    case 'send':    return <svg {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>;
    case 'menu':    return <svg {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case 'lock':    return <svg {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>;
    case 'sparkles':return <svg {...p}><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></svg>;
    case 'zap':     return <svg {...p}><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>;
    case 'help':    return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17.5v.5"/></svg>;
    case 'moon':    return <svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>;
    case 'sun':     return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case 'doc':     return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>;
    case 'photo':   return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>;
    default:        return <svg {...p}><circle cx="12" cy="12" r="3"/></svg>;
  }
};

/* ============================================================
   2. ATOMS & HELPERS
============================================================ */
const formatIDR = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const formatIDRShort = (n) => {
  if (n >= 1e9) return 'Rp ' + (n/1e9).toFixed(1) + ' M';
  if (n >= 1e6) return 'Rp ' + (n/1e6).toFixed(1) + ' jt';
  if (n >= 1e3) return 'Rp ' + (n/1e3).toFixed(0) + ' rb';
  return formatIDR(n);
};
const avatarColor = (i) => ['#3b82f6','#06b6d4','#8b5cf6','#f59e0b','#ec4899','#10b981','#ef4444'][Math.abs(i) % 7];
const initials = (n) => (n||'').split(' ').map(s=>s[0]).slice(0,2).join('');
const catIcon = {it:'laptop', tool:'wrench', furn:'chair', veh:'truck', lab:'flask', med:'cross', mach:'cog'};
const catTone = {it:'i', tool:'w', furn:'p', veh:'c', lab:'s', med:'d', mach:'pk'};
const catLabel = {it:'IT Equipment', tool:'Tools', furn:'Furniture', veh:'Vehicles', lab:'Lab', med:'Medical', mach:'Machinery'};

const Stat = ({label, value, sub, tone, icon}) => (
  <div className={`stat ${tone||''}`}>
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
      <div className="stat-l">{label}</div>
      {icon && <div className={`ico ${tone==='brand'?'i':tone||''}`} style={{width:24, height:24, borderRadius:5}}><Icon n={icon} s={11}/></div>}
    </div>
    <div className="stat-v display">{value}</div>
    {sub && <div className="stat-d">{sub}</div>}
  </div>
);

const Meter = ({pct, tone='brand'}) => (
  <div className="meter"><div className={`meter-f ${tone}`} style={{width: `${Math.max(0,Math.min(100,pct))}%`}}/></div>
);

const Spark = ({data, color='var(--brand)'}) => {
  const max = Math.max(...data);
  return (
    <div className="spark">
      {data.map((v,i) => <i key={i} style={{height: `${(v/max)*100}%`, background:color}}/>)}
    </div>
  );
};

const Avatar = ({name, i=0, size=26}) => (
  <div className="av" style={{background:avatarColor(i), width:size, height:size, fontSize: size*0.4}}>{initials(name)}</div>
);

const EmptyState = ({icon, title, desc, action}) => (
  <div className="empty">
    <div style={{width:48, height:48, borderRadius:12, background:'var(--surface-2)', display:'grid', placeItems:'center', color:'var(--text-3)'}}>
      <Icon n={icon||'box'} s={22}/>
    </div>
    <div>
      <div style={{fontWeight:600, color:'var(--text)', fontSize:13}}>{title}</div>
      {desc && <div style={{fontSize:12, marginTop:3}}>{desc}</div>}
    </div>
    {action}
  </div>
);

/* Reusable centered modal dialog */
const Modal = ({open, onClose, title, sub, children, footer, wide}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose && onClose(); }}>
      <div className={`modal ${wide?'wide':''}`} role="dialog" aria-modal="true">
        <div className="modal-h">
          <div>
            <div className="modal-h-t">{title}</div>
            {sub && <div className="modal-h-s">{sub}</div>}
          </div>
          <button className="btn btn-i btn-sm" onClick={onClose} aria-label="Close"><Icon n="x" s={14}/></button>
        </div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  );
};

/* Form field wrapper. type: text | select | textarea | number */
const Field = ({label, req, hint, type='text', value, onChange, options=[], placeholder, children, cols}) => (
  <div className="field" style={cols?{gridColumn:`span ${cols}`}:undefined}>
    {label && <label className="field-l">{label}{req && <span className="req">*</span>}</label>}
    {children ? children : type === 'select' ? (
      <select className="select" value={value} onChange={e=>onChange && onChange(e.target.value)}>
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea className="input" value={value} placeholder={placeholder} onChange={e=>onChange && onChange(e.target.value)}/>
    ) : (
      <input className="input" type={type} value={value} placeholder={placeholder} onChange={e=>onChange && onChange(e.target.value)}/>
    )}
    {hint && <div className="field-hint">{hint}</div>}
  </div>
);

const FieldRow = ({cols=2, children}) => (
  <div className="field-row" style={{gridTemplateColumns:`repeat(${cols}, 1fr)`}}>{children}</div>
);

/* ============================================================
   3. MOCK DATA
============================================================ */
const ASSETS = [
  {id:'IT-LP-9847', name:'MacBook Pro 16" M3 Max',       cat:'it',   loc:'JKT-HQ · Floor 8',     custodian:'Dewi A.',      val:50400000, dep:48000000, status:'deployed',   age:14,   serial:'C02XK9847GP6', purchased:'12 Jan 2025', warranty:'AppleCare to Jan 2028', supplier:'PT. Apple Indonesia', spark:[8,12,15,10,18,22,16,20,14,18,20,14,18,22], epc:'E280-1170-0000-50CA-9847'},
  {id:'TL-DR-0142', name:'Hilti TE 6-A22 Hammer Drill',   cat:'tool', loc:'JKT-Workshop · Crib',  custodian:'Tool Crib',     val:9800000,  dep:7200000,  status:'checked-out', age:62,   serial:'TE6A22-0142',   purchased:'08 Sep 2024', warranty:'2y to Sep 2026',        supplier:'PT. Astra Hilti',     spark:[12,8,18,22,14,8,12,18,22,18,14,8,12,16], epc:'E280-1170-0000-50CA-0142'},
  {id:'IT-MN-1284', name:'Dell U3223QE 32" Monitor',      cat:'it',   loc:'JKT-HQ · Floor 12',    custodian:'Rahmat S.',     val:13200000, dep:8400000,  status:'deployed',    age:182,  serial:'CN0M4G3GP6',    purchased:'14 Mar 2024', warranty:'4y to Mar 2028',        supplier:'PT. Dell Indonesia',  spark:[10,12,14,16,12,10,18,14,16,18,14,18,20,16], epc:'E280-1170-0000-50CA-1284'},
  {id:'VH-FK-0041', name:'Toyota Hilux 4x4 Forklift',     cat:'veh',  loc:'BDG-WH · Bay 2',       custodian:'Andi P.',       val:445000000, dep:268000000,status:'in-service',  age:620,  serial:'AHTKB1JT8001234',purchased:'02 Jun 2023', warranty:'expired',                supplier:'PT. Astra Toyota',    spark:[22,18,14,18,22,16,18,22,14,18,22,18,14,16], epc:'E280-1170-0000-50CA-0041'},
  {id:'LB-PH-0008', name:'Mettler PH Meter SevenExc.',    cat:'lab',  loc:'JKT-Lab · Station 3',  custodian:'Dr. Ratna I.',  val:58000000, dep:38000000, status:'deployed',    age:94,   serial:'METTLER-SE-0008', purchased:'19 Oct 2024', warranty:'3y to Oct 2027',         supplier:'PT. Mettler Toledo',  spark:[8,10,12,8,14,10,12,16,10,14,18,12,16,14], epc:'E280-1170-0000-50CA-0008'},
  {id:'MD-EC-0021', name:'Philips IntelliVue MX450',      cat:'med',  loc:'RS Husada · ICU-2',    custodian:'Dr. Surya',     val:218000000, dep:142000000,status:'deployed',    age:320,  serial:'PH-MX450-0021',    purchased:'14 Dec 2023', warranty:'5y to Dec 2028',         supplier:'PT. Philips Indonesia', spark:[14,12,16,14,18,12,16,18,14,16,18,14,16,18], epc:'E280-1170-0000-50CA-0021'},
  {id:'FU-CH-0420', name:'Herman Miller Aeron Chair',     cat:'furn', loc:'JKT-HQ · Floor 8',     custodian:'Budi S.',       val:22300000, dep:9200000,  status:'deployed',    age:410,  serial:'HM-AC-0420',       purchased:'18 Oct 2022', warranty:'12y to 2034',            supplier:'PT. Aeron Mebel',     spark:[10,8,12,8,10,12,8,12,10,8,12,8,10,8], epc:'E280-1170-0000-50CA-0420'},
  {id:'MC-CN-0011', name:'Mazak QTN-200 CNC Lathe',       cat:'mach', loc:'Mfg-1 · Cell A',       custodian:'Eko P.',        val:2890000000,dep:1840000000,status:'maint',       age:1820, serial:'MAZAK-QTN-0011',   purchased:'10 Mar 2020', warranty:'expired',                supplier:'PT. Yamazaki Mazak',  spark:[14,16,12,8,4,6,2,8,12,8,6,4,8,12], epc:'E280-1170-0000-50CA-0011'},
  {id:'IT-SV-2240', name:'Dell PowerEdge R760 Server',    cat:'it',   loc:'JKT-DC · Rack B-12',   custodian:'IT Ops',        val:194000000, dep:148000000,status:'deployed',    age:180,  serial:'DELL-R760-2240',   purchased:'04 Mar 2024', warranty:'5y to Mar 2029',         supplier:'PT. Dell Indonesia',  spark:[20,22,18,22,20,18,22,18,20,22,18,20,22,20], epc:'E280-1170-0000-50CA-2240'},
  {id:'TL-LA-0088', name:'Werner 28ft Extension Ladder',  cat:'tool', loc:'BDG-WH · Tool Wall',   custodian:'Tool Crib',     val:5800000,  dep:4400000,  status:'idle',        age:14,   serial:'WERNER-LA-0088',   purchased:'14 Jan 2025', warranty:'1y to Jan 2026',         supplier:'PT. Werner Sarana',   spark:[2,4,2,6,2,4,2,4,2,6,2,4,2,4], epc:'E280-1170-0000-50CA-0088'},
  {id:'TL-IM-0084', name:'Impact Wrench MT-2880',         cat:'tool', loc:'JKT-Workshop',         custodian:'Eko P.',        val:4800000,  dep:3200000,  status:'checked-out', age:24,   serial:'MT2880-0084',      purchased:'02 Dec 2024', warranty:'2y',                     supplier:'PT. Astra Hilti',     spark:[14,18,16,12,18,14,16,18,12,14,18,16,12,14], epc:'E280-1170-0000-50CA-0084'},
  {id:'IT-LP-9846', name:'MacBook Pro 16" M3 Max',        cat:'it',   loc:'JKT-HQ · Floor 8',     custodian:'Citra W.',      val:50400000, dep:48000000, status:'deployed',    age:14,   serial:'C02XK9846GP6',     purchased:'12 Jan 2025', warranty:'AppleCare to Jan 2028',  supplier:'PT. Apple Indonesia', spark:[8,10,12,14,12,16,10,14,18,16,14,18,20,16], epc:'E280-1170-0000-50CA-9846'},
];
const STATUS_TONE = {deployed:'s', 'in-service':'s', 'checked-out':'i', maint:'w', idle:'', retired:''};
const STATUS_LABEL = {deployed:'Deployed', 'in-service':'In Service', 'checked-out':'Checked Out', maint:'Maintenance', idle:'Idle', retired:'Retired'};

/* ============================================================
   4. NAV + SHELL
============================================================ */
const NAV = [
  {group:['Overview','Ringkasan'], items:[
    {id:'dashboard',  label:['Dashboard','Dashboard'],           icon:'dash'},
  ]},
  {group:['Assets','Aset'], items:[
    {id:'register',   label:['Asset Register','Daftar Aset'],   icon:'box',   badge:'12,420'},
    {id:'masterdata', label:['Master Data','Data Master'],      icon:'db'},
    {id:'rfid',       label:['RFID Tags · Print','Tag RFID · Cetak'], icon:'qr', badge:'24'},
  ]},
  {group:['Daily Operations','Operasi Harian'], items:[
    {id:'scan-in',    label:['Scan-In · Receiving','Scan-In · Penerimaan'], icon:'arrin',  badge:'28'},
    {id:'scan-out',   label:['Scan-Out · Disposal','Scan-Out · Pelepasan'], icon:'arrout', badge:'8'},
    {id:'checkout',   label:['Check-Out · Loans','Check-Out · Peminjaman'], icon:'swap', badge:'6'},
    {id:'transfer',   label:['Transfer','Mutasi Aset'],          icon:'swap',  badge:'18'},
  ]},
  {group:['Audit & Maintenance','Audit & Maintenance'], items:[
    {id:'audit',      label:['Stock Audit','Stock Opname'],     icon:'audit'},
    {id:'maintenance',label:['Maintenance · CMMS','Maintenance · CMMS'], icon:'wrench',badge:'42'},
  ]},
  {group:['Live','Live'], items:[
    {id:'rtls',       label:['Real-Time Location','Lokasi Real-Time'], icon:'pin'},
    {id:'security',   label:['Loss Prevention','Loss Prevention'], icon:'shield', badge:'3'},
  ]},
  {group:['System','Sistem'], items:[
    {id:'reports',    label:['Reports','Laporan'],                     icon:'doc'},
    {id:'users',      label:['User Management','Manajemen User'],  icon:'users'},
    {id:'settings',   label:['Settings','Pengaturan'],              icon:'cog'},
  ]},
  {group:['Help','Bantuan'], items:[
    {id:'docs',       label:['Documentation · How it works','Dokumentasi · Cara Pakai'], icon:'help'},
  ]},
];

function Sidebar({route, setRoute, lang, logout}){
  const L = lang === 'en' ? 0 : 1;
  return (
    <aside className="sb">
      <div className="sb-head">
        <div className="sb-logo">K</div>
        <div className="sb-brand">
          KATALYST
          <small>{lang==='en' ? 'Fixed Assets · RFID' : 'Aset Tetap · RFID'}</small>
        </div>
      </div>
      <div className="sb-nav">
        {NAV.map(g => (
          <div key={g.group[0]}>
            <div className="sb-group-label">{g.group[L]}</div>
            {g.items.map(it => (
              <div key={it.id}
                className={`sb-item ${route===it.id?'active':''}`}
                onClick={() => setRoute(it.id)}>
                <Icon n={it.icon} s={14}/>
                <span>{it.label[L]}</span>
                {it.badge && <span className="sb-badge">{it.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sb-foot">
        <Avatar name="Bambang W" i={3}/>
        <div className="sb-foot-info">
          <div className="sb-foot-name">Bambang W.</div>
          <div className="sb-foot-org">PT. Indojaya · Admin</div>
        </div>
        <button className="tb-action" onClick={logout} title={lang==='en'?'Sign out':'Keluar'} style={{width:28, height:28}}>
          <Icon n="arrout" s={14}/>
        </button>
      </div>
    </aside>
  );
}

function Topbar({route, openCmd, openNotif, toast, theme, setTheme, lang, setLang, navigate}){
  const L = lang === 'en' ? 0 : 1;
  const labels = {
    dashboard:    ['Dashboard','Dashboard'],
    register:     ['Asset Register','Daftar Aset'],
    detail:       ['Asset Detail','Detail Aset'],
    masterdata:   ['Master Data','Data Master'],
    'scan-in':    ['Scan-In · Receiving','Scan-In · Penerimaan Aset'],
    'scan-out':   ['Scan-Out · Disposal','Scan-Out · Pelepasan Aset'],
    transfer:     ['Transfer','Mutasi Aset'],
    checkout:     ['Check-Out · Loans','Check-Out · Peminjaman'],
    audit:        ['Stock Audit','Stock Opname'],
    maintenance:  ['Maintenance · CMMS','Maintenance · CMMS'],
    rtls:         ['Real-Time Location','Lokasi Real-Time'],
    security:     ['Loss Prevention','Loss Prevention'],
    users:        ['User Management','Manajemen User'],
    settings:     ['Settings','Pengaturan'],
    rfid:         ['RFID Tags · Register & Print','Tag RFID · Daftar & Cetak'],
    reports:      ['Reports','Laporan'],
    docs:         ['Documentation · How it works','Dokumentasi · Cara Pakai'],
  };
  const searchPlaceholder = lang==='en' ? 'Search assets, EPC, location, custodian…' : 'Cari aset, EPC, lokasi, custodian…';
  return (
    <div className="tb">
      <div className="tb-crumbs">
        <span>PT. Indojaya</span>
        <span className="sep">/</span>
        <b>{(labels[route]||['Page','Halaman'])[L]}</b>
      </div>
      <div className="tb-search" onClick={openCmd}>
        <Icon n="search" s={13}/>
        <input placeholder={searchPlaceholder} readOnly/>
        <span className="kbd">⌘K</span>
      </div>
      <div className="tb-end">
        <button className="tb-action" title={theme==='light' ? 'Switch to dark mode' : 'Switch to light mode'}
          onClick={()=>setTheme(theme==='light' ? 'dark' : 'light')}>
          <Icon n={theme==='light' ? 'moon' : 'sun'} s={15}/>
        </button>
        <button className="tb-action" title="Notifications" onClick={openNotif}><Icon n="bell" s={15}/><span className="dot"/></button>
        <button className="tb-action" title={lang==='en'?'Help & Documentation':'Bantuan & Dokumentasi'} onClick={()=>navigate('docs')}><Icon n="help" s={15}/></button>
        <button className="tb-action" title="Settings" onClick={()=>navigate('settings')}><Icon n="cog" s={15}/></button>
      </div>
    </div>
  );
}

/* ============================================================
   5. PAGES
============================================================ */

/* --- DASHBOARD --- */
function DashboardPage({navigate, toast}){
  const recent = [
    {t:'2m ago',  icon:'arrout',ic:'i', txt:'Hilti Drill TL-0142 checked out by Andi P.', go:'detail', id:'TL-DR-0142'},
    {t:'14m',     icon:'check', ic:'s', txt:'Zone B3 stock audit complete · 184 / 184'},
    {t:'42m',     icon:'wrench',ic:'w', txt:'WO-2410-088 opened · CNC MC-0011',   go:'maintenance'},
    {t:'1h',      icon:'arrin', ic:'s', txt:'Ladder TL-0088 returned'},
    {t:'2h',      icon:'pin',   ic:'i', txt:'Server SV-2240 transferred to Rack B-12'},
    {t:'4h',      icon:'alert', ic:'d', txt:'Forklift VH-FK-0041 left its geofence', go:'security'},
  ];

  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Good afternoon, Bambang 👋</h1>
          <p className="page-desc">Real-time asset status for PT. Indojaya. <span className="mono" style={{color:'var(--text)'}}>12,420</span> assets tracked · live data <span className="ping"/></p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast('Data refreshed · 12,420 assets')}><Icon n="refresh" s={13}/>Refresh</button>
          <button className="btn" onClick={()=>toast('Dashboard exported to PDF · processing')}><Icon n="dl" s={13}/>Export</button>
          <button className="btn btn-primary" onClick={()=>navigate('scan-in')}><Icon n="plus" s={13}/>Add assets</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:12, marginBottom:18}}>
        <Stat label="Total assets"          value="12,420"           sub={<><span className="b s">+184 Q-to-date</span></>} tone="brand" icon="box"/>
        <Stat label="Capital value"        value={<>Rp 14,8 <small>M</small></>} sub="net book Rp 8,2 M"               tone="cyan"  icon="dollar"/>
        <Stat label="Utilization"          value="72%"              sub="+4pp vs Q3"                                tone="success" icon="zap"/>
        <Stat label="Active alerts"       value="28"                sub="7 missing · 12 overdue"                  tone="warn" icon="alert"/>
        <Stat label="Audit progress · Q4"  value="78%"              sub="9,684 / 12,420 counted"                  tone="brand" icon="audit"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:14}}>
        {/* Quick actions */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Quick actions · Daily operations</div>
              <div className="card-sub">Most-used flows. Click to jump.</div>
            </div>
          </div>
          <div className="card-b" style={{padding:14}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
              {[
                {id:'scan-in',    icon:'arrin',  tone:'s', t:'Scan-In',    d:'Receive new assets · bulk tag'},
                {id:'scan-out',   icon:'arrout', tone:'d', t:'Scan-Out',   d:'Disposal / write-off'},
                {id:'transfer',   icon:'swap',   tone:'i', t:'Transfer',   d:'Between locations / custodians'},
                {id:'audit',      icon:'audit',  tone:'c', t:'Audit',       d:'Start a stock audit'},
                {id:'maintenance',icon:'wrench', tone:'w', t:'Work Order',  d:'Open a new WO'},
                {id:'register',   icon:'box',    tone:'p', t:'Register',    d:'Browse all assets'},
              ].map(a => (
                <button key={a.id} onClick={()=>navigate(a.id)} style={{
                  display:'flex', alignItems:'center', gap:11,
                  padding:'13px 14px', background:'var(--surface-2)',
                  border:'1px solid var(--border)', borderRadius:8,
                  textAlign:'left', transition: 'all .14s',
                }} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.background='var(--surface-3)'}}
                   onMouseLeave={(e)=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface-2)'}}>
                  <div className={`ico ${a.tone}`}><Icon n={a.icon} s={15}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, fontSize:13}}>{a.t}</div>
                    <div style={{fontSize:11, color:'var(--text-3)', marginTop:1}}>{a.d}</div>
                  </div>
                  <Icon n="chev" s={14} c="" />
                </button>
              ))}
            </div>

            <div style={{marginTop:18, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div className="card" style={{padding:14, background:'var(--surface-2)'}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                  <div className="ico i"><Icon n="sparkles" s={15}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, fontSize:13}}>AI Insight · Predictive</div>
                    <div style={{fontSize:11, color:'var(--text-3)'}}>14 assets predicted to fail within 30 days</div>
                  </div>
                </div>
                <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.55}}>
                  CNC Mazak <b className="mono">MC-0011</b> spindle vibration +28% above baseline. Health score 34/100 — bearing replacement recommended this week.
                </div>
                <button className="btn btn-sm btn-primary" style={{marginTop:10, width:'100%'}} onClick={()=>navigate('maintenance')}>View related WO <Icon n="chev" s={11}/></button>
              </div>
              <div className="card" style={{padding:14, background:'var(--surface-2)'}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                  <div className="ico d"><Icon n="alert" s={15}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, fontSize:13}}>Loss Prevention</div>
                    <div style={{fontSize:11, color:'var(--text-3)'}}>3 active alerts · 1 critical</div>
                  </div>
                </div>
                <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.55}}>
                  <b className="mono">IT-LP-9847</b> attempted to exit the lobby without a valid check-out. CCTV auto-tagged, security paged.
                </div>
                <button className="btn btn-sm btn-danger" style={{marginTop:10, width:'100%'}} onClick={()=>navigate('security')}>View alert <Icon n="chev" s={11}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="card">
          <div className="card-h">
            <div className="card-t">Recent activity · Live feed</div>
            <span className="ping"/>
          </div>
          <div style={{padding:0}}>
            {recent.map((a,i)=>(
              <div key={i}
                onClick={()=>{ if(a.go) navigate(a.go); else toast('Detail not available in this prototype'); }}
                style={{
                  display:'flex', alignItems:'flex-start', gap:10,
                  padding:'10px 16px', borderBottom: i<5?'1px solid var(--border-soft)':0,
                  cursor: a.go ? 'pointer' : 'default',
                  transition: 'background .12s',
                }}
                onMouseEnter={(e)=>{if(a.go) e.currentTarget.style.background='rgba(59,130,246,.06)'}}
                onMouseLeave={(e)=>{e.currentTarget.style.background='transparent'}}>
                <div className={`ico ${a.ic}`} style={{width:24, height:24, borderRadius:5}}><Icon n={a.icon} s={11}/></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:11.5, lineHeight:1.45}}>{a.txt}</div>
                  <div style={{fontSize:10, color:'var(--text-3)', marginTop:3}}>{a.t}</div>
                </div>
                {a.go && <Icon n="chev" s={12} c=""/>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginTop:14}}>
        <div className="card">
          <div className="card-h"><div className="card-t">Category distribution</div></div>
          <div className="card-b">
            {[
              {n:'IT Equipment',     v:4820, pct:38, cat:'it'},
              {n:'Furniture',         v:2840, pct:23, cat:'furn'},
              {n:'Tools',             v:2140, pct:17, cat:'tool'},
              {n:'Vehicles',          v:842,  pct:7,  cat:'veh'},
              {n:'Lab',               v:620,  pct:5,  cat:'lab'},
              {n:'Other',           v:1158, pct:10, cat:'mach'},
            ].map((c,i)=>(
              <div key={i} style={{marginBottom:11}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:11.5, marginBottom:4}}>
                  <span style={{display:'flex', alignItems:'center', gap:7}}>
                    <span className={`ico ${catTone[c.cat]}`} style={{width:18, height:18, borderRadius:4}}>
                      <Icon n={catIcon[c.cat]} s={9}/>
                    </span>
                    <span style={{fontWeight:500}}>{c.n}</span>
                  </span>
                  <span className="mono" style={{fontWeight:600, color:'var(--text-2)'}}>{c.v.toLocaleString()}</span>
                </div>
                <Meter pct={c.pct*2.5}/>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h"><div className="card-t">Utilization · 7 days</div></div>
          <div className="card-b" style={{padding:14}}>
            <div style={{display:'grid', gridTemplateColumns:'80px repeat(7,1fr)', gap:3, fontSize:9.5}}>
              <div></div>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><div key={d} style={{textAlign:'center', color:'var(--text-3)'}}>{d}</div>)}
              {[
                {l:'IT',        vals:[.85,.88,.86,.92,.94,.42,.32]},
                {l:'Tools',     vals:[.78,.82,.84,.88,.92,.62,.38]},
                {l:'Vehicles',  vals:[.62,.74,.82,.88,.94,.42,.18]},
                {l:'Lab',        vals:[.42,.48,.52,.54,.42,.12,.08]},
                {l:'Medical',   vals:[.78,.82,.84,.86,.84,.82,.78]},
                {l:'Machinery', vals:[.92,.94,.96,.98,.94,.42,.12]},
              ].map(row=>(
                <React.Fragment key={row.l}>
                  <div style={{color:'var(--text-3)', fontWeight:550, fontSize:10}}>{row.l}</div>
                  {row.vals.map((v,c)=>(
                    <div key={c} style={{
                      height:18, borderRadius:3,
                      background: v > .85 ? 'var(--success)' : v > .65 ? 'var(--brand)' : v > .4 ? 'var(--warn)' : 'var(--surface-3)',
                      opacity: 0.35 + v*0.65,
                    }} title={`${Math.round(v*100)}%`}/>
                  ))}
                </React.Fragment>
              ))}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8, marginTop:14, fontSize:10, color:'var(--text-3)'}}>
              <span>Idle</span>
              <div style={{flex:1, height:5, borderRadius:3, background:'linear-gradient(90deg, var(--surface-3), var(--warn), var(--brand), var(--success))'}}/>
              <span>Max</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><div className="card-t">Top-value assets in the field</div></div>
          <div style={{padding:0}}>
            {ASSETS.filter(a => a.val > 100000000).slice(0, 5).map((a,i) => (
              <div key={a.id}
                className="row-link"
                onClick={()=>navigate('detail', {assetId: a.id})}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
                  borderBottom: i<4?'1px solid var(--border-soft)':0, cursor:'pointer',
                  transition:'background .12s',
                }}
                onMouseEnter={(e)=>{e.currentTarget.style.background='rgba(59,130,246,.06)'}}
                onMouseLeave={(e)=>{e.currentTarget.style.background='transparent'}}
              >
                <div className={`ico ${catTone[a.cat]}`} style={{width:30, height:30, borderRadius:6}}><Icon n={catIcon[a.cat]} s={13}/></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.name}</div>
                  <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{a.id}</div>
                </div>
                <div className="mono" style={{fontSize:11, fontWeight:600, color:'var(--cyan)'}}>{formatIDRShort(a.val)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MULTI-SITE ROLLUP + LIVE RFID STREAM */}
      <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:14, marginTop:14}}>
        <div className="card">
          <div className="card-h">
            <div className="card-t">Site rollup · 12 sites</div>
            <span className="b s dot">10 online · 2 offline</span>
          </div>
          <div className="card-b" style={{padding:14}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
              {[
                {n:'JKT-HQ',     city:'Jakarta',    assets:'4,820', val:6800000000, status:'on',  pct:84},
                {n:'JKT-DC',     city:'Jakarta',    assets:'142',   val:1240000000, status:'on',  pct:96},
                {n:'JKT-WS',     city:'Jakarta',    assets:'484',   val:480000000,  status:'on',  pct:78},
                {n:'BDG-OFF',    city:'Bandung',    assets:'1,420', val:1840000000, status:'on',  pct:88},
                {n:'BDG-WH',     city:'Bandung',    assets:'420',   val:520000000,  status:'on',  pct:72},
                {n:'MDN-OFF',    city:'Medan',      assets:'420',   val:380000000,  status:'on',  pct:80},
                {n:'SBY-WH',     city:'Surabaya',   assets:'380',   val:280000000,  status:'on',  pct:68},
                {n:'DPS-OFF',    city:'Denpasar',   assets:'260',   val:220000000,  status:'on',  pct:82},
                {n:'Mfg-1',       city:'Cikarang',   assets:'186',   val:3200000000, status:'on',  pct:94},
                {n:'RS Husada',  city:'Jakarta',    assets:'248',   val:780000000,  status:'on',  pct:88},
                {n:'BPN-OFF',    city:'Balikpapan', assets:'140',   val:120000000,  status:'off', pct:0,  sub:'sync error'},
                {n:'PLB-OFF',    city:'Palembang',  assets:'180',   val:140000000,  status:'off', pct:0,  sub:'WAN down 14m'},
              ].map((s,i) => (
                <div key={s.n} onClick={()=>toast(`Switched to ${s.n} \u00b7 ${s.city}`)} style={{
                  padding:'10px 12px', borderRadius:8,
                  border:'1px solid var(--border)',
                  background: s.status==='off' ? 'color-mix(in oklab, var(--danger-soft) 25%, var(--surface-2))' : 'var(--surface-2)',
                  cursor:'pointer', transition:'all .14s',
                  opacity: s.status==='off' ? .85 : 1,
                }}>
                  <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6}}>
                    <div>
                      <div className="mono" style={{fontWeight:650, fontSize:12.5}}>{s.n}</div>
                      <div style={{fontSize:10, color:'var(--text-3)'}}>{s.city}</div>
                    </div>
                    <span className={`b ${s.status==='off'?'d':'s'} dot`} style={{fontSize:9}}>{s.status==='off'?'OFF':'LIVE'}</span>
                  </div>
                  <div>
                    <div className="mono" style={{fontWeight:650, fontSize:14}}>{s.assets}</div>
                    <div className="mono" style={{fontSize:9, color:'var(--cyan)'}}>{formatIDRShort(s.val)}</div>
                  </div>
                  {s.status === 'on' ? (
                    <div style={{marginTop:6}}>
                      <Meter pct={s.pct} tone={s.pct<70?'warn':'brand'}/>
                      <div className="mono" style={{fontSize:9, color:'var(--text-3)', marginTop:2}}>util {s.pct}%</div>
                    </div>
                  ) : (
                    <div style={{fontSize:9.5, color:'var(--danger)', marginTop:6}}>{s.sub}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <div className="card-t">Live RFID gate reads</div>
            <span className="ping"/>
          </div>
          <div style={{padding:'8px 0', maxHeight:380, overflow:'hidden'}}>
            {[
              {t:'2s',  g:'Gate-8N',  a:'IT-LP-9847', dir:'in',  who:'Dewi A.',   rssi:-48},
              {t:'5s',  g:'Gate-WS',  a:'TL-DR-0142', dir:'out', who:'Andi P.',   rssi:-52},
              {t:'8s',  g:'Gate-12N', a:'IT-MN-1284', dir:'in',  who:'Rahmat S.', rssi:-46},
              {t:'14s', g:'Gate-DC',  a:'IT-SV-2240', dir:'in',  who:'IT Ops',    rssi:-44},
              {t:'18s', g:'Gate-Lab', a:'LB-PH-0008', dir:'in',  who:'Dr. Ratna', rssi:-50},
              {t:'24s', g:'Gate-WS',  a:'TL-IM-0084', dir:'out', who:'Eko P.',    rssi:-54},
              {t:'31s', g:'Gate-8N',  a:'FU-CH-0420', dir:'in',  who:'Budi S.',   rssi:-49},
              {t:'42s', g:'Gate-MFG', a:'MC-CN-0011', dir:'in',  who:'Eko P.',    rssi:-48},
            ].map((e,i) => (
              <div key={i} onClick={()=>navigate('detail',{assetId:e.a})} style={{
                display:'flex', alignItems:'center', gap:10, padding:'8px 16px',
                borderBottom: i<7?'1px solid var(--border-soft)':0, cursor:'pointer',
              }}>
                <div className={`ico ${e.dir==='in'?'s':'w'}`} style={{width:24, height:24, borderRadius:5}}>
                  <Icon n={e.dir==='in'?'arrin':'arrout'} s={11}/>
                </div>
                <div className="mono" style={{fontSize:10, color:'var(--text-3)', minWidth:30}}>{e.t}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div className="mono" style={{fontSize:10.5, fontWeight:650}}>{e.a}</div>
                  <div style={{fontSize:9.5, color:'var(--text-3)'}}>{e.g} · {e.who}</div>
                </div>
                <span className="mono" style={{fontSize:9.5, color:'var(--cyan)'}}>{e.rssi} dBm</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINANCIAL + UPCOMING MAINTENANCE */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14}}>
        <div className="card">
          <div className="card-h">
            <div className="card-t">Financial summary · PSAK 16</div>
            <button className="btn btn-sm btn-ghost" onClick={()=>toast('Opening FA financial report · Excel')}>View detail</button>
          </div>
          <div className="card-b">
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <Stat label="Total acquisition" value={formatIDRShort(14820000000)} sub="12,420 assets" tone="cyan"/>
              <Stat label="Net book value"     value={formatIDRShort(8240000000)}  sub="55% remaining" tone="success"/>
              <Stat label="Accum. depreciation"    value={formatIDRShort(6580000000)}  sub="44% used"      tone="warn"/>
              <Stat label="Depr. this month"    value={formatIDRShort(154000000)}   sub="auto-posted GL" tone="brand"/>
            </div>
            <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', margin:'14px 0 8px'}}>Breakdown by category</div>
            {[
              {n:'IT Equipment',         cost:3840000000, nbv:1630000000, pct:42},
              {n:'Furniture',             cost:1620000000, nbv:880000000,  pct:54},
              {n:'Vehicles',              cost:2420000000, nbv:1340000000, pct:55},
              {n:'Industrial Machinery', cost:2890000000, nbv:1050000000, pct:36},
              {n:'Medical Devices',       cost:2140000000, nbv:1460000000, pct:68},
            ].map((c,i)=>(
              <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'5px 0', fontSize:11.5}}>
                <div style={{flex:1}}>{c.n}</div>
                <div className="mono" style={{color:'var(--text-3)', fontSize:10.5}}>{formatIDRShort(c.cost)}</div>
                <div style={{width:60}}><Meter pct={c.pct} tone={c.pct<40?'warn':'brand'}/></div>
                <div className="mono" style={{fontWeight:600, color:'var(--success)', minWidth:80, textAlign:'right'}}>{formatIDRShort(c.nbv)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <div className="card-t">Maintenance · next 30 days</div>
            <button className="btn btn-sm btn-ghost" onClick={()=>navigate('maintenance')}>View all</button>
          </div>
          <div style={{padding:0}}>
            {[
              {d:'Tomorrow',   dt:'18 Jan', t:'PM IT Servers · Rack B · 8 unit',  tone:'d', icon:'cog'},
              {d:'3 days',   dt:'20 Jan', t:'PH Meter calibration · LB-PH-0008',  tone:'w', icon:'flask'},
              {d:'7 days',   dt:'24 Jan', t:'Forklift service · VH-FK-0041',     tone:'w', icon:'truck'},
              {d:'14 days', dt:'31 Jan', t:'Safety Inspection · 24 fire ext.', tone:'i', icon:'shield'},
              {d:'18 days', dt:'4 Feb',  t:'Medical inspection · ICU-2 · 4 units',tone:'i', icon:'cross'},
              {d:'22 days', dt:'8 Feb',  t:'Filter HVAC · Floor 8-12',          tone:'',  icon:'cog'},
              {d:'28 days', dt:'14 Feb', t:'Warranty expiring · 4 laptops Q1',     tone:'',  icon:'tag'},
            ].map((m,i)=>(
              <div key={i} onClick={()=>navigate('maintenance')} style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
                borderBottom: i<6?'1px solid var(--border-soft)':0, cursor:'pointer',
              }}>
                <div className={`ico ${m.tone||''}`} style={{width:28, height:28, borderRadius:6}}><Icon n={m.icon} s={12}/></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:11.5, fontWeight:600}}>{m.t}</div>
                  <div style={{fontSize:10, color:'var(--text-3)', marginTop:2}}>{m.d} · {m.dt}</div>
                </div>
                <button className="btn btn-i btn-sm" onClick={(e)=>{e.stopPropagation(); toast('Opening WO: ' + m.t)}}><Icon n="chev" s={11}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- ASSET REGISTER --- */
function RegisterPage({navigate, toast}){
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');
  const [sel, setSel] = useState(()=>new Set());

  const filtered = useMemo(() => {
    return ASSETS.filter(a => {
      if (cat !== 'all' && a.cat !== cat) return false;
      if (status !== 'all' && a.status !== status) return false;
      if (q) {
        const ql = q.toLowerCase();
        return a.name.toLowerCase().includes(ql) || a.id.toLowerCase().includes(ql) ||
          a.custodian.toLowerCase().includes(ql) || a.loc.toLowerCase().includes(ql) ||
          a.epc.toLowerCase().includes(ql);
      }
      return true;
    });
  }, [q, cat, status]);

  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Asset Register</h1>
          <p className="page-desc">Single source of truth · 12,420 registered assets · search by name, EPC, S/N, custodian, or location.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast('Import CSV · choose a .csv or .xlsx file')}><Icon n="up" s={13}/>Import</button>
          <button className="btn" onClick={()=>toast('Exported ' + filtered.length + ' assets to Excel')}><Icon n="dl" s={13}/>Export</button>
          <button className="btn btn-primary" onClick={()=>navigate('scan-in')}><Icon n="plus" s={13}/>Add assets</button>
        </div>
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div style={{padding:'12px 14px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
          <div className="tb-search" style={{maxWidth:340, height:32}}>
            <Icon n="search" s={13}/>
            <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <select className="select" value={cat} onChange={e=>setCat(e.target.value)} style={{minWidth:150}}>
            <option value="all">All categories</option>
            {Object.entries(catLabel).map(([k,v])=> <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="select" value={status} onChange={e=>setStatus(e.target.value)} style={{minWidth:140}}>
            <option value="all">All statuses</option>
            <option value="deployed">Deployed</option>
            <option value="checked-out">Checked Out</option>
            <option value="maint">Maintenance</option>
            <option value="idle">Idle</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={()=>toast('Advanced filters · location, custodian, age, value, EPC range')}><Icon n="filter" s={12}/>More filters</button>
          <span style={{marginLeft:'auto', fontSize:11.5, color:'var(--text-3)'}}>
            <span className="mono" style={{color:'var(--text)'}}>{filtered.length}</span> of <span className="mono">12,420</span> assets
          </span>
        </div>
      </div>

      {sel.size > 0 && (
        <div className="card" style={{marginBottom:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, background:'linear-gradient(90deg, var(--brand-soft), color-mix(in oklab, var(--brand-soft) 60%, var(--surface)))', borderColor:'color-mix(in oklab, var(--brand) 32%, var(--border))'}}>
          <div className="ico i" style={{width:32, height:32}}><Icon n="check" s={15}/></div>
          <div style={{flex:1}}>
            <div style={{fontWeight:650, fontSize:13}}><span className="mono" style={{color:'var(--brand-strong)'}}>{sel.size}</span> assets selected</div>
            <div style={{fontSize:11, color:'var(--text-2)', marginTop:2}}>Choose a bulk action for the selected assets</div>
          </div>
          <button className="btn btn-sm" onClick={()=>{navigate('transfer'); toast(sel.size + ' assets selected for transfer');}}><Icon n="swap" s={11}/>Bulk transfer</button>
          <button className="btn btn-sm" onClick={()=>{navigate('scan-out'); toast(sel.size + ' assets selected for disposal');}}><Icon n="arrout" s={11}/>Bulk dispose</button>
          <button className="btn btn-sm" onClick={()=>{navigate('rfid'); toast(sel.size + ' tags queued for re-print');}}><Icon n="qr" s={11}/>Print labels</button>
          <button className="btn btn-sm" onClick={()=>toast('Bulk change custodian · ' + sel.size + ' assets')}><Icon n="user" s={11}/>Change custodian</button>
          <button className="btn btn-sm" onClick={()=>toast('Exported ' + sel.size + ' assets to Excel')}><Icon n="dl" s={11}/>Export</button>
          <button className="btn btn-sm btn-ghost" onClick={()=>setSel(new Set())}><Icon n="x" s={11}/>Clear</button>
        </div>
      )}

      <div className="card">
        <div style={{overflowX:'auto'}}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:34, paddingRight:0}}>
                  <input type="checkbox" checked={filtered.length>0 && filtered.every(a=>sel.has(a.id))} onChange={e=>{
                    if (e.target.checked) setSel(new Set(filtered.map(a=>a.id)));
                    else setSel(new Set());
                  }} style={{cursor:'pointer'}}/>
                </th>
                <th>Asset</th>
                <th>Category</th>
                <th>Location</th>
                <th>Custodian</th>
                <th style={{textAlign:'right'}}>Value · NBV</th>
                <th>Status</th>
                <th>Activity 14d</th>
                <th style={{width:40}}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a,i) => (
                <tr key={a.id} className={`row-link ${sel.has(a.id)?'sel':''}`} onClick={()=>navigate('detail', {assetId: a.id})}>
                  <td style={{paddingRight:0}} onClick={e=>{e.stopPropagation(); setSel(s=>{const n=new Set(s); n.has(a.id)?n.delete(a.id):n.add(a.id); return n;});}}>
                    <input type="checkbox" checked={sel.has(a.id)} onChange={()=>{}} style={{cursor:'pointer'}}/>
                  </td>
                  <td>
                    <div className="cell-asset">
                      <div className={`ico ${catTone[a.cat]}`}><Icon n={catIcon[a.cat]} s={14}/></div>
                      <div style={{minWidth:0}}>
                        <div className="asset-name">{a.name}</div>
                        <div className="asset-id">{a.id} · <span style={{color:'var(--text-4)'}}>{a.epc.slice(0,14)}</span></div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`b ${catTone[a.cat]}`}>{catLabel[a.cat]}</span></td>
                  <td style={{color:'var(--text-2)'}}>{a.loc}</td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:7}}>
                      <Avatar name={a.custodian} i={i} size={22}/>
                      <span style={{fontSize:12}}>{a.custodian}</span>
                    </div>
                  </td>
                  <td className="mono" style={{textAlign:'right'}}>
                    <div style={{fontWeight:600}}>{formatIDRShort(a.val)}</div>
                    <div style={{fontSize:10, color:'var(--success)'}}>{formatIDRShort(a.dep)}</div>
                  </td>
                  <td><span className={`b ${STATUS_TONE[a.status]} dot`}>{STATUS_LABEL[a.status]}</span></td>
                  <td><Spark data={a.spark}/></td>
                  <td><Icon n="chev" s={14} c=""/></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="9">
                  <EmptyState
                    icon="search"
                    title="No matching assets"
                    desc="Try changing filters or the search query"
                    action={<button className="btn btn-sm" onClick={()=>{setQ(''); setCat('all'); setStatus('all');}}>Reset filters</button>}
                  />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot">
          <span>Showing {filtered.length} assets</span>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <button className="btn btn-sm btn-ghost" disabled>‹ Prev</button>
            <span className="b" style={{padding:'3px 10px'}}>1 / 1,035</span>
            <button className="btn btn-sm btn-ghost" onClick={()=>toast('Page 2 of 1,035')}>Next ›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- ASSET DETAIL --- */
function DetailPage({navigate, ctx, toast}){
  const asset = ASSETS.find(a => a.id === ctx?.assetId) || ASSETS[0];
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="page page-in">
      <div className="page-head" style={{alignItems:'center'}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate('register')}><Icon n="arrowl" s={12}/>Back</button>
            <span style={{color:'var(--text-3)', fontSize:11}}>Register / {catLabel[asset.cat]}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <h1 className="page-title">{asset.name}</h1>
            <span className={`b ${STATUS_TONE[asset.status]} dot`}>{STATUS_LABEL[asset.status]}</span>
          </div>
          <p className="page-desc mono" style={{fontSize:11}}>{asset.id} · EPC {asset.epc} · S/N {asset.serial}</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>{navigate('scan-out'); toast(`${asset.id} added to the disposal queue`);}}><Icon n="arrout" s={13}/>Dispose</button>
          <button className="btn" onClick={()=>{navigate('transfer'); toast(`${asset.id} selected for transfer`);}}><Icon n="swap" s={13}/>Transfer</button>
          <button className="btn" onClick={()=>{navigate('maintenance'); toast(`New work order for ${asset.id}`);}}><Icon n="wrench" s={13}/>Service</button>
          <button className="btn btn-primary" onClick={()=>setEditOpen(true)}><Icon n="cog" s={13}/>Edit</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'340px 1fr', gap:14}}>
        {/* LEFT - Asset card */}
        <div className="card">
          <div style={{padding:14, borderBottom:'1px solid var(--border)'}}>
            <div style={{
              height:160, borderRadius:9,
              background: `linear-gradient(135deg, ${avatarColor(asset.cat.charCodeAt(0))}22, ${avatarColor(asset.cat.charCodeAt(1))}11)`,
              border:'1px solid var(--border)',
              display:'grid', placeItems:'center', color:avatarColor(asset.cat.charCodeAt(0)),
              position:'relative',
            }}>
              <Icon n={catIcon[asset.cat]} s={56}/>
              <div style={{position:'absolute', bottom:8, right:8}}>
                <div style={{
                  width:48, height:48, background:'#fff', borderRadius:5, padding:4,
                  display:'grid', gridTemplateColumns:'repeat(8,1fr)', gridTemplateRows:'repeat(8,1fr)',
                }}>
                  {Array.from({length:64}, (_,i) => (
                    <div key={i} style={{background: ((asset.id.charCodeAt(i % asset.id.length) + i) % 2 === 0) ? '#000' : 'transparent'}}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="card-b">
            <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'7px 12px', fontSize:11.5}}>
              <span style={{color:'var(--text-3)'}}>Category</span><b>{catLabel[asset.cat]}</b>
              <span style={{color:'var(--text-3)'}}>Location</span><b>{asset.loc}</b>
              <span style={{color:'var(--text-3)'}}>Custodian</span>
              <div style={{display:'flex', alignItems:'center', gap:6}}><Avatar name={asset.custodian} i={1} size={20}/><b>{asset.custodian}</b></div>
              <span style={{color:'var(--text-3)'}}>S/N</span><b className="mono" style={{fontSize:11}}>{asset.serial}</b>
              <span style={{color:'var(--text-3)'}}>Embedded tag · EPC</span>
              <b className="mono" style={{fontSize:11, color:'var(--brand-strong)'}}>{asset.epc}</b>
              <span style={{color:'var(--text-3)'}}>Acquired</span><b>{asset.purchased}</b>
              <span style={{color:'var(--text-3)'}}>Supplier</span><b>{asset.supplier}</b>
              <span style={{color:'var(--text-3)'}}>Warranty</span><b>{asset.warranty}</b>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:14}}>
              <div className="stat" style={{padding:'10px 12px'}}>
                <div className="stat-l">Asset value</div>
                <div className="stat-v" style={{fontSize:16}}>{formatIDRShort(asset.val)}</div>
              </div>
              <div className="stat" style={{padding:'10px 12px'}}>
                <div className="stat-l">Net book</div>
                <div className="stat-v" style={{fontSize:16, color:'var(--success)'}}>{formatIDRShort(asset.dep)}</div>
              </div>
            </div>

            <div style={{marginTop:14, display:'flex', flexWrap:'wrap', gap:5}}>
              <span className="b i">{asset.cat==='it'?'Engineering':asset.cat==='lab'?'R&D':'Operations'}</span>
              <span className="b">Active</span>
              <span className="b s">Insured</span>
              <span className="b">PSAK 16 · 4y SL</span>
            </div>
          </div>
        </div>

        {/* RIGHT - Tabs + content */}
        <div className="card" style={{display:'flex', flexDirection:'column', minHeight:540}}>
          <div className="tabs" style={{padding:'0 16px', margin:0}}>
            {[
              {id:'overview', l:'Overview'},
              {id:'activity', l:'Activity · 84'},
              {id:'maintenance', l:'Maintenance · 2'},
              {id:'depreciation', l:'Depreciation'},
              {id:'docs', l:'Documents · 6'},
            ].map(t => (
              <button key={t.id} className={`tab ${tab===t.id?'on':''}`} onClick={()=>setTab(t.id)}>{t.l}</button>
            ))}
          </div>

          <div style={{padding:18, flex:1}}>
            {tab === 'overview' && (
              <>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:18}}>
                  <Stat label="Days deployed" value={asset.age + 'd'} sub="active since Jan 2025" />
                  <Stat label="Avg uptime/day" value="9.4h" sub="last 30d" tone="success"/>
                  <Stat label="Locations visited" value="4" sub="Jakarta · Bandung"/>
                  <Stat label="Next PM" value="62d" sub="22 Mar 2026" tone="warn"/>
                </div>

                <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12}}>Timeline lifecycle</div>
                <div style={{position:'relative', paddingLeft:24}}>
                  <div style={{position:'absolute', left:9, top:8, bottom:8, width:2, background:'var(--border)'}}/>
                  {[
                    {t:'Today',     d:'Last RFID ping · gate-8N, −48 dBm', icon:'radar',  ic:'i'},
                    {t:'2m ago',       d:'EPC scanned at lobby gate',          icon:'radar',  ic:'i'},
                    {t:'14 Jan 2025',  d:'Handed over to Dewi A. · BAST signed', icon:'arrout', ic:'s'},
                    {t:'12 Jan 2025',  d:'QC pass · macOS imaging complete',    icon:'check',  ic:'s'},
                    {t:'11 Jan 2025',  d:'EPC encoded at tagging station',     icon:'tag',    ic:'i'},
                    {t:'10 Jan 2025',  d:'Received · PO-2025-0042',            icon:'arrin',  ic:'s'},
                  ].map((e,i) => (
                    <div key={i} style={{marginBottom:14, position:'relative'}}>
                      <div className={`ico ${e.ic}`} style={{position:'absolute', left:-24, width:22, height:22, borderRadius:5}}><Icon n={e.icon} s={11}/></div>
                      <div style={{fontSize:10, color:'var(--text-3)'}}>{e.t}</div>
                      <div style={{fontSize:12.5, fontWeight:550, marginTop:1}}>{e.d}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'activity' && (
              <div style={{margin:'-8px 0'}}>
                {[
                  {t:'14:22', txt:'EPC ping · gate-8N · −48 dBm',         tone:'i'},
                  {t:'12:08', txt:'Today · 14× scans @ Floor 8',        tone:'s'},
                  {t:'9:42',  txt:'Yesterday · returned to desk 8-142',     tone:'s'},
                  {t:'17:14', txt:'Yesterday · checked out for a presentation', tone:'i'},
                  {t:'…',    txt:'80 earlier events · 14 active days', tone:''},
                ].map((e,i)=>(
                  <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:i<4?'1px solid var(--border-soft)':0}}>
                    <span className={`sd ${e.tone||''}`} style={{color: e.tone==='s'?'var(--success)':e.tone==='i'?'var(--brand)':'var(--text-3)', background: e.tone==='s'?'var(--success)':e.tone==='i'?'var(--brand)':'var(--text-3)'}}/>
                    <span className="mono" style={{minWidth:56, fontSize:11, color:'var(--text-3)'}}>{e.t}</span>
                    <span style={{fontSize:12}}>{e.txt}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'maintenance' && (
              <EmptyState
                icon="wrench"
                title="No active WOs"
                desc="2 WOs closed in the last 90 days · next PM in 62 days"
                action={<button className="btn btn-primary btn-sm" onClick={()=>{navigate('maintenance'); toast('New WO for ' + asset.id)}}><Icon n="plus" s={12}/>Create WO</button>}
              />
            )}

            {tab === 'depreciation' && (
              <>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:18}}>
                  <Stat label="Cost" value={formatIDRShort(asset.val)} sub="acquisition cost"/>
                  <Stat label="Accum. depr." value={formatIDRShort(asset.val - asset.dep)} sub="14 months" tone="warn"/>
                  <Stat label="Net book value" value={formatIDRShort(asset.dep)} sub="as of today" tone="success"/>
                  <Stat label="Remaining life" value="3y 2m" sub="PSAK 16 · 4y SL"/>
                </div>
                <svg viewBox="0 0 500 120" style={{width:'100%', height:130}}>
                  <line x1="20" y1="100" x2="480" y2="100" stroke="var(--border)"/>
                  <line x1="20" y1="100" x2="20" y2="10" stroke="var(--border)"/>
                  <path d="M20,16 L120,32 L220,48 L325,68 L430,90 L470,98" stroke="var(--brand)" strokeWidth="2" fill="none"/>
                  <path d="M20,16 L120,32 L220,48 L325,68 L430,90 L470,98 L470,100 L20,100 Z" fill="var(--brand)" opacity=".15"/>
                  <circle cx="48" cy="20" r="4" fill="var(--brand)"/>
                  <text x="56" y="16" fontSize="10" fill="var(--text-2)">Today · {formatIDRShort(asset.dep)}</text>
                  {['Y0','Y1','Y2','Y3','Y4'].map((y,i)=>(
                    <text key={y} x={20+i*112.5} y="115" fontSize="9.5" fill="var(--text-3)" textAnchor="middle">{y}</text>
                  ))}
                </svg>
              </>
            )}

            {tab === 'docs' && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                {[
                  {n:'Invoice PO-2025-0042.pdf',    d:'12 Jan 2025 · 142 KB'},
                  {n:'BAST Serah Terima.pdf',       d:'14 Jan 2025 · 84 KB'},
                  {n:'AppleCare+ Certificate.pdf',  d:'12 Jan 2025 · 56 KB'},
                  {n:'Handover Photos (4).zip',    d:'14 Jan 2025 · 2.4 MB'},
                  {n:'Insurance Allianz P-2410.pdf',d:'15 Jan 2025 · 124 KB'},
                  {n:'Asset Tagging Photo.jpg',     d:'12 Jan 2025 · 1.8 MB'},
                ].map((d,i)=>(
                  <div key={i} className="card" style={{padding:'10px 12px', background:'var(--surface-2)', cursor:'pointer'}} onClick={()=>toast('Opening ' + d.n)}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <Icon n="doc" s={18} c=""/>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:12, fontWeight:550}}>{d.n}</div>
                        <div style={{fontSize:10, color:'var(--text-3)'}}>{d.d}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditAssetModal open={editOpen} onClose={()=>setEditOpen(false)} toast={toast} asset={asset}/>
    </div>
  );
}

/* --- SCAN-IN · RECEIVING --- */
function ScanInPage({navigate, toast}){
  const [step, setStep] = useState(1);
  const [scannedCount, setScannedCount] = useState(0);
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScannedCount(c => c + 1);
      setScanning(false);
      toast(`EPC E280-1170-...-984${scannedCount + 8} encoded`);
    }, 900);
  };

  const completeStep = () => {
    if (step < 3) {
      setStep(step + 1);
      toast('Step complete — continuing to step ' + (step + 1));
    } else {
      toast('Assets ready to deploy · BAST generated automatically ✓');
      setTimeout(() => navigate('register'), 800);
    }
  };

  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Scan-In · Asset Receiving</h1>
          <p className="page-desc">Receive new POs → bulk RFID tagging → assign custodians → ready to deploy. Every asset gets a unique EPC and enters the fixed-asset register automatically.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast('Import PO from Accurate / Odoo · choose a source')}><Icon n="up" s={13}/>Import PO</button>
          <button className="btn" onClick={()=>toast('Receiving history · last 12 months')}><Icon n="cal" s={13}/>Receiving history</button>
        </div>
      </div>

      {/* Progress steps */}
      <div className="card" style={{marginBottom:14, padding:'16px 20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:0}}>
          {[
            {n:1, l:'Select PO', d:'Match items to the PO'},
            {n:2, l:'Tagging RFID', d:'Encode an EPC per unit'},
            {n:3, l:'QC + Deploy', d:'Assign custodian'},
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{display:'flex', alignItems:'center', gap:10, flex: i===2 ? 0 : 0, flexShrink:0}}>
                <div style={{
                  width:30, height:30, borderRadius:50,
                  background: step >= s.n ? 'var(--brand)' : 'var(--surface-3)',
                  color: step >= s.n ? '#fff' : 'var(--text-3)',
                  display:'grid', placeItems:'center', fontWeight:700, fontSize:13,
                  boxShadow: step === s.n ? '0 0 0 3px rgba(59,130,246,.25)' : 'none',
                  transition:'all .2s',
                }}>
                  {step > s.n ? <Icon n="check" s={14}/> : s.n}
                </div>
                <div>
                  <div style={{fontWeight:600, fontSize:13, color: step >= s.n ? 'var(--text)' : 'var(--text-3)'}}>{s.l}</div>
                  <div style={{fontSize:10.5, color:'var(--text-3)'}}>{s.d}</div>
                </div>
              </div>
              {i < 2 && (
                <div style={{
                  flex:1, height:2, margin:'0 16px', borderRadius:1,
                  background: step > i+1 ? 'var(--brand)' : 'var(--surface-3)',
                  transition:'background .2s',
                }}/>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {step === 1 && <ScanInStep1 onNext={completeStep} toast={toast}/>}
      {step === 2 && <ScanInStep2 scannedCount={scannedCount} onScan={handleScan} scanning={scanning} onNext={completeStep}/>}
      {step === 3 && <ScanInStep3 onNext={completeStep}/>}
    </div>
  );
}

function ScanInStep1({onNext, toast}){
  const [sel, setSel] = useState('PO-2025-0042');
  const pos = [
    {po:'PO-2025-0042', sup:'PT. Apple Indonesia', items:24, val:768000000, due:'Today', urgent:true},
    {po:'PO-2025-0041', sup:'PT. Astra Hilti',     items:18, val:124000000, due:'2 days'},
    {po:'PO-2025-0040', sup:'CV. Mebel Jaya',       items:48, val:682000000, due:'3 days'},
    {po:'PO-2025-0039', sup:'PT. Mitsubishi Forkl.', items:2,  val:5680000000, due:'1 week'},
  ];
  return (
    <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14}}>
      <div className="card">
        <div className="card-h"><div className="card-t">PO queue · select one to receive</div></div>
        <div style={{padding:0}}>
          {pos.map(p => (
            <div key={p.po}
              onClick={()=>setSel(p.po)}
              style={{
                padding:'14px 18px',
                borderBottom:'1px solid var(--border-soft)',
                cursor:'pointer',
                background: sel===p.po ? 'rgba(59,130,246,.07)' : 'transparent',
                borderLeft: sel===p.po ? '3px solid var(--brand)' : '3px solid transparent',
                transition:'all .14s',
              }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                <div>
                  <div className="mono" style={{fontWeight:600, fontSize:13, color: sel===p.po?'var(--brand-strong)':'var(--text)'}}>{p.po}</div>
                  <div style={{fontSize:11.5, color:'var(--text-2)', marginTop:3}}>{p.sup}</div>
                </div>
                {p.urgent && <span className="b w">SLA · today</span>}
              </div>
              <div style={{display:'flex', alignItems:'center', gap:14, fontSize:11.5, color:'var(--text-3)'}}>
                <span><Icon n="box" s={11}/> {p.items} items</span>
                <span><Icon n="cal" s={11}/> due {p.due}</span>
                <span style={{marginLeft:'auto'}} className="mono"><b style={{color:'var(--cyan)'}}>{formatIDRShort(p.val)}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><div className="card-t">{sel} · Detail PO</div><span className="b s">Approved</span></div>
        <div className="card-b">
          <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'7px 12px', fontSize:11.5, marginBottom:14}}>
            <span style={{color:'var(--text-3)'}}>Supplier</span><b>PT. Apple Indonesia</b>
            <span style={{color:'var(--text-3)'}}>Owner</span><b>Bambang W. · CFO</b>
            <span style={{color:'var(--text-3)'}}>PO date</span><b>05 Jan 2025</b>
            <span style={{color:'var(--text-3)'}}>Arrival date</span><b style={{color:'var(--warn)'}}>Today, 12 Jan</b>
            <span style={{color:'var(--text-3)'}}>Value</span><b className="mono" style={{color:'var(--cyan)'}}>Rp 768.000.000</b>
            <span style={{color:'var(--text-3)'}}>PPN 11%</span><b className="mono">Rp 84.480.000</b>
          </div>

          <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>Line items</div>
          {[
            {n:'MacBook Pro 16" M3 Max', q:24, u:'Rp 32.000.000'},
          ].map((li,i)=>(
            <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 11px', background:'var(--surface-2)', borderRadius:7, marginBottom:5}}>
              <div className="ico i"><Icon n="laptop" s={14}/></div>
              <div style={{flex:1}}>
                <div style={{fontWeight:550, fontSize:12}}>{li.n}</div>
                <div style={{fontSize:10.5, color:'var(--text-3)'}}>Qty {li.q} × {li.u}</div>
              </div>
            </div>
          ))}

          <button className="btn btn-primary" style={{width:'100%', marginTop:14}} onClick={onNext}>
            Start tagging · 24 items <Icon n="chev" s={12}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function ScanInStep2({scannedCount, onScan, scanning, onNext}){
  const target = 24;
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:14}}>
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">Item {scannedCount + 1} of {target}</div>
            <div className="card-sub">MacBook Pro 16" M3 Max</div>
          </div>
        </div>
        <div className="card-b">
          <div style={{
            height:140, borderRadius:9, marginBottom:14,
            background:'linear-gradient(135deg, rgba(59,130,246,.15), rgba(6,182,212,.08))',
            border:'1px solid var(--border)',
            display:'grid', placeItems:'center', color:'var(--brand-strong)',
          }}>
            <Icon n="laptop" s={52}/>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'7px 12px', fontSize:11.5}}>
            <span style={{color:'var(--text-3)'}}>Item</span><b>MacBook Pro 16" M3 Max</b>
            <span style={{color:'var(--text-3)'}}>Supplier S/N</span><b className="mono">C02XK984{7+scannedCount}GP6</b>
            <span style={{color:'var(--text-3)'}}>Value/unit</span><b className="mono">Rp 32.000.000</b>
          </div>

          <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:14, marginBottom:8}}>Quick assignment</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
            {[
              {l:'Location', v:'JKT-HQ · F8'},
              {l:'Cost ctr', v:'CC-ENG-001'},
              {l:'Useful life', v:'4 yrs · SL'},
              {l:'Custodian', v:'(on deploy)'},
            ].map((f,i) => (
              <div key={i} style={{background:'var(--surface-2)', borderRadius:6, padding:'7px 10px'}}>
                <div style={{fontSize:9.5, color:'var(--text-3)'}}>{f.l}</div>
                <div style={{fontSize:11, fontWeight:550}}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{display:'flex', flexDirection:'column'}}>
        <div className="card-h">
          <div className="card-t">RFID Tagging Station</div>
          <span className="b s dot">Station online</span>
        </div>
        <div style={{flex:1, padding:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          {/* Big scan portal */}
          <div style={{
            width:240, height:240, borderRadius:50,
            background: scanning ?
              'radial-gradient(circle, rgba(59,130,246,.4) 0%, rgba(59,130,246,.05) 70%, transparent 100%)' :
              'radial-gradient(circle, rgba(59,130,246,.18) 0%, rgba(59,130,246,.02) 70%, transparent 100%)',
            display:'grid', placeItems:'center',
            position:'relative',
            transition:'background .3s',
          }}>
            <div style={{
              width:130, height:130, borderRadius:50,
              border: scanning ? '3px solid var(--brand-strong)' : '2px dashed var(--brand)',
              display:'grid', placeItems:'center',
              transition:'all .3s',
              animation: scanning ? 'pulse 1s ease-in-out infinite' : 'none',
            }}>
              <Icon n="radar" s={56} c=""/>
            </div>
            {scanning && (
              <div style={{
                position:'absolute', inset:0, borderRadius:50,
                border:'1px solid var(--brand)', opacity:.4,
                animation: 'pulse 1.8s ease-in-out infinite',
              }}/>
            )}
          </div>

          <div style={{textAlign:'center', marginTop:20, marginBottom:8}}>
            <div className="display" style={{fontSize:34, fontWeight:600}}>{scannedCount}<span style={{color:'var(--text-3)', fontSize:18}}> / {target}</span></div>
            <div style={{fontSize:11.5, color:'var(--text-3)', marginTop:3}}>Items tagged</div>
          </div>

          <div style={{width:280, maxWidth:'80%'}}>
            <Meter pct={(scannedCount/target)*100} tone="brand"/>
          </div>

          <div style={{display:'flex', gap:8, marginTop:20, width:'100%', justifyContent:'center'}}>
            {scannedCount < target ? (
              <button className="btn btn-primary" disabled={scanning} onClick={onScan} style={{padding:'0 24px', height:38}}>
                {scanning ? (<><Icon n="radar" s={14}/> Scanning…</>) : (<><Icon n="qr" s={14}/> Encode RFID tag</>)}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={onNext} style={{padding:'0 24px', height:38}}>
                <Icon n="check" s={14}/> Tagging complete · to QC
              </button>
            )}
            <button className="btn" onClick={onScan} disabled={scanning || scannedCount >= target}>Skip</button>
          </div>

          {/* Recently scanned */}
          <div style={{width:'100%', marginTop:24}}>
            <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>Just encoded</div>
            <div style={{maxHeight:80, overflow:'auto'}}>
              {Array.from({length: Math.min(scannedCount, 5)}, (_,i) => {
                const n = scannedCount - i;
                return (
                  <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'5px 0', borderBottom: i<Math.min(scannedCount,5)-1?'1px solid var(--border-soft)':0, fontSize:11.5}}>
                    <Icon n="check" s={12} c=""/>
                    <span className="mono" style={{flex:1, color:'var(--text-2)'}}>E280-1170-...-984{(7+n).toString().padStart(2,'0')}</span>
                    <span style={{color:'var(--text-3)', fontSize:10}}>{i===0 ? 'just now' : `${i*5}s ago`}</span>
                  </div>
                );
              })}
              {scannedCount === 0 && <div style={{textAlign:'center', color:'var(--text-3)', fontSize:11, padding:8}}>No items yet · click "Encode RFID tag"</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanInStep3({onNext}){
  const [assignAll, setAssignAll] = useState('Dewi Anggraini');
  const [allReady, setAllReady] = useState(false);
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
      <div className="card">
        <div className="card-h"><div className="card-t">QC + Deploy · 24 items</div><span className="b s">Tagging complete</span></div>
        <div className="card-b">
          <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Bulk assignment</div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            <label style={{fontSize:11, color:'var(--text-2)'}}>
              Custodian
              <input className="input" style={{display:'block', marginTop:4, width:'100%'}} value={assignAll} onChange={e=>setAssignAll(e.target.value)} placeholder="Search employee name…"/>
            </label>
            <label style={{fontSize:11, color:'var(--text-2)'}}>
              Default location
              <select className="select" style={{display:'block', marginTop:4, width:'100%'}}>
                <option>JKT-HQ · Floor 8 · Engineering</option>
                <option>JKT-HQ · Floor 12 · Design</option>
                <option>BDG-Office · Floor 2</option>
              </select>
            </label>
            <label style={{fontSize:11, color:'var(--text-2)'}}>
              Cost center
              <select className="select" style={{display:'block', marginTop:4, width:'100%'}}>
                <option>CC-ENG-001 · Engineering</option>
                <option>CC-DSN-001 · Design</option>
                <option>CC-OPS-001 · Operations</option>
              </select>
            </label>
            <label style={{display:'flex', alignItems:'center', gap:8, marginTop:8, fontSize:12, cursor:'pointer'}}>
              <input type="checkbox" checked={allReady} onChange={e=>setAllReady(e.target.checked)}/>
              <span>QC inspection complete · all assets ready to deploy</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="card-t">Deploy summary</div>
          <span className="b i">24 items</span>
        </div>
        <div className="card-b">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14}}>
            <Stat label="Total value" value={formatIDRShort(768000000)} tone="cyan"/>
            <Stat label="Avg / unit" value={formatIDRShort(32000000)}/>
            <Stat label="PSAK 16" value="4y · SL" sub="auto depreciation enabled"/>
            <Stat label="Auto-generate" value="BAST · QR · Cards" tone="brand"/>
          </div>

          <div style={{padding:11, background:'var(--surface-2)', borderRadius:7, fontSize:11.5, lineHeight:1.55, marginBottom:14}}>
            When you click <b>Deploy & post to GL</b>, the system will:
            <ul style={{margin:'6px 0 0', paddingLeft:18}}>
              <li>Post to GL · DR Fixed Assets 1501-IT, CR Cash 1101</li>
              <li>Generate the BAST PDF · auto-email to Dewi A.</li>
              <li>Print 24 asset cards with QR codes</li>
              <li>Enable automatic daily depreciation</li>
            </ul>
          </div>

          <button className="btn btn-primary" disabled={!allReady} style={{width:'100%'}} onClick={onNext}>
            <Icon n="check" s={14}/> Deploy &amp; post to GL · {formatIDRShort(768000000)}
          </button>
          {!allReady && <div style={{fontSize:10.5, color:'var(--text-3)', textAlign:'center', marginTop:6}}>Tick the QC checklist to continue</div>}
        </div>
      </div>
    </div>
  );
}

/* --- SCAN-OUT · PELEPASAN --- */
function ScanOutPage({navigate, toast}){
  const [sel, setSel] = useState(0);
  const [disposalOpen, setDisposalOpen] = useState(false);
  const [extra, setExtra] = usePersisted('kfa_disposals', []);

  const baseQueue = [
    {a:'Dell Latitude 7420', id:'IT-LP-3421', cat:'it',   reason:'Obsolete · 5y EOL',         nbv:0,         rec:1200000,  status:'CFO approval',   tone:'i'},
    {a:'Hilti Drill TL-0021',id:'TL-DR-0021', cat:'tool', reason:'Damaged · beyond repair',  nbv:4200000,   rec:0,        status:'Dept Head',      tone:'w'},
    {a:'Toyota Hilux 2018',  id:'VH-04',      cat:'veh',  reason:'Sold at auction',       nbv:84000000,  rec:142000000,status:'Finance review', tone:'w'},
    {a:'Aeron Chair',         id:'FU-CH-0184',cat:'furn', reason:'Lost · Q4 audit',     nbv:8400000,   rec:0,        status:'CFO approval',   tone:'i'},
    {a:'Mettler Balance',     id:'LB-BL-0011',cat:'lab',  reason:'Donated to a university', nbv:12000000,  rec:0,        status:'Approved',       tone:'s'},
    {a:'Forklift OldModel',   id:'VH-FK-0008',cat:'veh',  reason:'Sold',                nbv:28000000,  rec:18000000, status:'BAST signed',    tone:'s'},
  ];
  const queue = [...extra, ...baseQueue];
  const item = queue[sel];

  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Scan-Out · Asset Disposal</h1>
          <p className="page-desc">Retire assets: sold, scrapped, donated, lost, or obsolete. Multi-step approvals, automatic journal entries, auto-generated BAST.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast('Handover certificate (BAST) PDF downloaded · ready for signature')}><Icon n="dl" s={13}/>BAST PDF</button>
          <button className="btn btn-primary" onClick={()=>setDisposalOpen(true)}><Icon n="plus" s={13}/>New disposal request</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
        <Stat label="This month" value="24" sub={formatIDRShort(184000000) + ' NBV written off'} tone="warn"/>
        <Stat label="Awaiting approval" value="8" sub="3 Dept Head · 5 Finance" tone="brand"/>
        <Stat label="Recovery value YTD" value={formatIDRShort(42000000)} sub="from sales + auctions" tone="success"/>
        <Stat label="Corporate tax impact" value={'-' + formatIDRShort(18000000)} sub="tax shield" tone="success"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14}}>
        <div className="card">
          <div className="card-h"><div className="card-t">Disposal queue</div></div>
          <table className="tbl">
            <thead>
              <tr><th>Asset</th><th>Reason</th><th style={{textAlign:'right'}}>NBV</th><th style={{textAlign:'right'}}>Recovery</th><th>Status</th></tr>
            </thead>
            <tbody>
              {queue.map((r,i)=>(
                <tr key={i} className={`row-link ${sel===i?'sel':''}`} onClick={()=>setSel(i)}>
                  <td>
                    <div className="cell-asset">
                      <div className={`ico ${catTone[r.cat]}`} style={{width:28, height:28, borderRadius:6}}><Icon n={catIcon[r.cat]} s={12}/></div>
                      <div>
                        <div className="asset-name">{r.a}</div>
                        <div className="asset-id">{r.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{color:'var(--text-2)', fontSize:11.5}}>{r.reason}</td>
                  <td className="mono" style={{textAlign:'right', color: r.nbv>0?'var(--danger)':'var(--text-3)'}}>{r.nbv>0?formatIDRShort(r.nbv):'—'}</td>
                  <td className="mono" style={{textAlign:'right', color:r.rec>0?'var(--success)':'var(--text-3)'}}>{r.rec>0?formatIDRShort(r.rec):'—'}</td>
                  <td><span className={`b ${r.tone}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">{item.a}</div>
              <div className="card-sub mono">{item.id} · {item.reason}</div>
            </div>
          </div>
          <div className="card-b">
            <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Approval flow</div>
            {[
              {l:'Submitted',   w:'Andi P.', t:'Mon 09:14', done:true},
              {l:'Dept Head',   w:'Rahmat S.', t:'Mon 11:42', done:true},
              {l:'Finance Mgr', w:'Ratna I.',  t:'Tue 14:08', done:true},
              {l:'CFO',          w:'Surya D.',  t:'pending',  done:false, current:true},
              {l:'BAST + GL',    w:'auto',      t:'pending',   done:false},
            ].map((s,i)=>(
              <div key={i} style={{display:'flex', gap:11, padding:'6px 0', position:'relative'}}>
                {i<4 && <div style={{position:'absolute', left:13, top:30, width:2, height:'100%', background: s.done?'var(--success)':'var(--border)'}}/>}
                <div style={{
                  width:26, height:26, borderRadius:50, flexShrink:0,
                  background: s.done?'var(--success)':s.current?'var(--warn)':'var(--surface-3)',
                  color: s.done?'#0f1219':s.current?'#0f1219':'var(--text-3)',
                  display:'grid', placeItems:'center', fontSize:11, fontWeight:700, position:'relative', zIndex:1,
                  boxShadow: s.current ? '0 0 0 3px rgba(251,191,36,.25)' : 'none',
                }}>{s.done ? <Icon n="check" s={12}/> : i+1}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:600, fontSize:12}}>{s.l}</div>
                  <div style={{fontSize:10.5, color:'var(--text-3)'}}>{s.w} · {s.t}</div>
                </div>
              </div>
            ))}

            <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:18, marginBottom:8}}>Journal entry · preview</div>
            <div className="mono" style={{fontSize:10.5, background:'var(--surface-2)', borderRadius:7, padding:'10px 12px', lineHeight:1.7}}>
              <div style={{color:'var(--text-3)', fontSize:9.5, marginBottom:4, fontWeight:600}}>ADJ-2025-{item.id}</div>
              <div style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'1px 10px'}}>
                {item.rec > 0 && (<><span>DR</span><span>Cash · Sale proceeds</span><span>{formatIDR(item.rec).replace('Rp ','')}</span></>)}
                {item.nbv > 0 && (<><span>DR</span><span>Accum. depreciation</span><span>{formatIDR(item.val||item.nbv*3).replace('Rp ','')}</span></>)}
                <span>CR</span><span>Fixed assets</span><span>{formatIDR((item.val||(item.nbv*3))+item.rec).replace('Rp ','')}</span>
                {item.rec > item.nbv && (<><span>CR</span><span>Gain on Disposal</span><span>{formatIDR(item.rec-item.nbv).replace('Rp ','')}</span></>)}
              </div>
            </div>

            <div style={{display:'flex', gap:6, marginTop:12}}>
              <button className="btn" style={{flex:1}} onClick={()=>toast('Sent back for revision · returned to Dept Head')}>Revise</button>
              <button className="btn btn-danger" style={{flex:1}} onClick={()=>toast('Disposal rejected')}>Reject</button>
              <button className="btn btn-primary" style={{flex:2}} onClick={()=>{
                toast('BAST signed · GL entry posted ✓');
              }}>Approve · sign BAST</button>
            </div>
          </div>
        </div>
      </div>

      <DisposalRequestModal open={disposalOpen} onClose={()=>setDisposalOpen(false)} toast={toast}
        onSubmit={(r)=>{ setExtra(x=>[{a:r.asset.name, id:r.asset.id, cat:r.asset.cat, reason:r.method, nbv:r.asset.dep, rec:r.recovery, status:'Dept Head', tone:'w'}, ...x]); setSel(0); }}/>
    </div>
  );
}

/* --- TRANSFER · MUTASI --- */
function TransferPage({navigate, toast}){
  const [newOpen, setNewOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [extra, setExtra] = usePersisted('kfa_transfers', []);
  const baseTransfers = [
    {id:'MUT-2410-0142', n:'8 MacBook Pro · IT batch', from:'JKT-HQ · F8', to:'BDG-Office',     by:'Dewi A.', stage:2, late:false},
    {id:'MUT-2410-0141', n:'Mitsubishi Forklift',       from:'JKT-WH · Bay 2', to:'BDG-WH · Bay 1', by:'Andi P.', stage:2, late:false},
    {id:'MUT-2410-0140', n:'24 Aeron Chairs',           from:'Lobby storage',  to:'JKT · F12',     by:'Facilities', stage:3, late:false},
    {id:'MUT-2410-0139', n:'Mettler PH Meter',          from:'BDG-Lab',        to:'JKT-Lab',        by:'Dr. Ratna', stage:1, late:false},
    {id:'MUT-2410-0136', n:'Philips IntelliVue',        from:'RS · ICU2',     to:'RS · OR3',       by:'Med Eng',   stage:2, late:true},
  ];
  const transfers = [...extra, ...baseTransfers];

  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Asset Transfers</h1>
          <p className="page-desc">Move assets between locations / custodians. Dispatched → in transit → received. RFID gates auto-confirm receipt and cost centers re-allocate automatically.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>setHistOpen(true)}><Icon n="cal" s={13}/>History</button>
          <button className="btn btn-primary" onClick={()=>setNewOpen(true)}><Icon n="plus" s={13}/>New transfer</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
        <Stat label="In transit" value="18" sub="avg 1.4 days · 4 cross-site" tone="brand"/>
        <Stat label="Awaiting receipt" value="6" sub="2 late &gt; 3 days" tone="warn"/>
        <Stat label="This month" value="142" sub="+18% vs last month" tone="success"/>
        <Stat label="Cross-site" value="38%" sub="JKT ↔ BDG most active"/>
      </div>

      <div className="card">
        <div className="card-h"><div className="card-t">Active transfers · live</div></div>
        <div style={{padding:0}}>
          {transfers.map((t,i)=>(
            <div key={t.id} style={{padding:'14px 18px', borderBottom: i<transfers.length-1 ? '1px solid var(--border-soft)' : 0}}>
              <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
                <div className={`ico ${t.stage===3?'s':t.late?'d':t.stage===1?'w':'i'}`} style={{width:32, height:32}}>
                  <Icon n="swap" s={14}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:3}}>
                    <span className="mono" style={{fontSize:10.5, color:'var(--text-3)'}}>{t.id}</span>
                    {t.late && <span className="b d">Late by 2 days</span>}
                  </div>
                  <div style={{fontWeight:600, fontSize:13}}>{t.n}</div>
                  <div style={{display:'flex', alignItems:'center', gap:6, fontSize:11.5, color:'var(--text-2)', marginTop:4}}>
                    <Icon n="pin" s={11}/>{t.from}
                    <Icon n="chev" s={10} c=""/>
                    <b style={{color:'var(--text)'}}>{t.to}</b>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}>
                    {['Dispatched','In-transit','Received'].map((s, j) => (
                      <div key={j} style={{display:'flex', alignItems:'center', gap:6}}>
                        <div style={{
                          width:9, height:9, borderRadius:50,
                          background: j+1 <= t.stage ? 'var(--success)' : 'var(--surface-3)',
                          boxShadow: j+1 === t.stage ? '0 0 8px rgba(45,212,191,.6)' : 'none',
                        }}/>
                        <span style={{fontSize:10.5, color: j+1 <= t.stage ? 'var(--success)' : 'var(--text-3)', fontWeight: j+1===t.stage?650:500}}>{s}</span>
                        {j<2 && <span style={{width:24, height:1, background: j+1 < t.stage ? 'var(--success)' : 'var(--surface-3)'}}/>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <Avatar name={t.by} i={i} size={22}/>
                  <div style={{fontSize:10, color:'var(--text-3)', marginTop:5}}>{t.by}</div>
                </div>
                {t.stage === 2 && (
                  <button className="btn btn-sm btn-primary" onClick={()=>toast(`${t.id} confirmed received via RFID gate`)}>Confirm receipt</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TransferModal open={newOpen} onClose={()=>setNewOpen(false)} toast={toast}
        onSubmit={(r)=>setExtra(x=>[{id:'MUT-2410-0' + (143+x.length), n:r.asset.name, from:r.asset.loc, to:r.to, by:'Bambang W.', stage:1, late:false}, ...x])}/>
      <TransferHistoryModal open={histOpen} onClose={()=>setHistOpen(false)}/>
    </div>
  );
}

/* --- STOCK AUDIT --- */
function AuditPage({navigate, toast}){
  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Stock Audit · Q4 2025</h1>
          <p className="page-desc">RFID-enabled physical audit · 78% counted · meets BPKP / external-audit standards · adjustment journal prepared automatically.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast('Q4 2025 audit report (Berita Acara) generated')}><Icon n="dl" s={13}/>Audit report PDF</button>
          <button className="btn btn-primary" onClick={()=>toast('Continuing sweep · next zone: BDG-WH Bay 2')}><Icon n="radar" s={13}/>Continue sweep</button>
        </div>
      </div>

      {/* Progress banner */}
      <div className="card" style={{marginBottom:14}}>
        <div style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:18}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <div style={{fontWeight:650, fontSize:13}}>Audit progress · 22 of 28 zones</div>
              <div style={{display:'flex', gap:18, fontSize:11.5, color:'var(--text-2)'}}>
                <span>Started · Mon 09:00</span>
                <span>Duration · <b className="mono" style={{color:'var(--text)'}}>4h 18m</b></span>
                <span>Auditor · <b style={{color:'var(--text)'}}>Rahmat S.</b></span>
              </div>
            </div>
            <Meter pct={78} tone="brand"/>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="display" style={{fontSize:26, fontWeight:600, color:'var(--brand-strong)'}}>78%</div>
            <div style={{fontSize:10, color:'var(--text-3)'}}>9,684 / 12,420</div>
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:18}}>
        <Stat label="Counted" value="9,684" sub="100% coverage" tone="success"/>
        <Stat label="Variances found" value="14" sub="4 missing · 6 wrong-loc · 4 surplus" tone="warn"/>
        <Stat label="Impact NBV" value={'-' + formatIDRShort(14200000)} sub="0.17% · within tolerance" tone="danger"/>
        <Stat label="Zones remaining" value="6" sub="BDG-WH 2-3 · MDN · SBY"/>
        <Stat label="Sign-off" value="4 / 6" sub="awaiting CFO + committee" tone="warn"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14}}>
        <div className="card">
          <div className="card-h"><div className="card-t">Reconciliation by zone</div></div>
          <table className="tbl">
            <thead>
              <tr><th>Zone</th><th style={{textAlign:'right'}}>System</th><th style={{textAlign:'right'}}>Physical</th><th style={{textAlign:'right'}}>Variance</th><th style={{textAlign:'right'}}>NBV Δ</th><th>Status</th></tr>
            </thead>
            <tbody>
              {[
                {z:'JKT-HQ · Floor 8 (Eng)',     s:142, f:142, v:0,  nbv:0,         tone:'s'},
                {z:'JKT-HQ · Floor 8 (Design)',  s:108, f:108, v:0,  nbv:0,         tone:'s'},
                {z:'JKT-HQ · Floor 12 (Sales)',  s:96,  f:94,  v:-2, nbv:-5200000,  tone:'d'},
                {z:'JKT-DC · Server racks',      s:48,  f:48,  v:0,  nbv:0,         tone:'s'},
                {z:'JKT-Workshop · Tool Crib',   s:284, f:281, v:-3, nbv:-4200000,  tone:'d'},
                {z:'JKT-Workshop · Bay 1-3',     s:48,  f:52,  v:4,  nbv:1800000,   tone:'w'},
                {z:'BDG-Office · Floor 2',       s:142, f:140, v:-2, nbv:-4800000,  tone:'w'},
                {z:'BDG-WH · Bay 2',             s:48,  f:0,   v:'—', nbv:'—',      tone:''},
                {z:'BDG-WH · Bay 3',             s:36,  f:0,   v:'—', nbv:'—',      tone:''},
                {z:'MDN-Office',                  s:64,  f:0,   v:'—', nbv:'—',      tone:''},
                {z:'SBY-WH',                      s:42,  f:0,   v:'—', nbv:'—',      tone:''},
              ].map((r,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:550}}>{r.z}</td>
                  <td className="mono" style={{textAlign:'right'}}>{r.s}</td>
                  <td className="mono" style={{textAlign:'right'}}>{r.f || '—'}</td>
                  <td className="mono" style={{textAlign:'right', fontWeight:650, color: r.v<0?'var(--danger)':r.v>0?'var(--warn)':r.v===0?'var(--text-3)':'var(--text-3)'}}>{r.v === 0 ? '—' : (typeof r.v === 'number' && r.v > 0 ? '+' : '') + r.v}</td>
                  <td className="mono" style={{textAlign:'right', color: typeof r.nbv === 'number' && r.nbv < 0 ? 'var(--danger)' : typeof r.nbv === 'number' && r.nbv > 0 ? 'var(--warn)' : 'var(--text-3)'}}>{r.nbv ? (typeof r.nbv === 'number' ? formatIDRShort(r.nbv) : r.nbv) : '—'}</td>
                  <td>{r.tone ? <span className={`b ${r.tone}`}>{r.tone==='s'?'OK':r.tone==='d'?'Missing':'Variance'}</span> : <span className="b">Pending</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div className="card">
            <div className="card-h"><div className="card-t">Adjustment journal entry</div><span className="b w">Draft</span></div>
            <div className="card-b">
              <div className="mono" style={{fontSize:10.5, background:'var(--surface-2)', borderRadius:7, padding:'10px 12px', lineHeight:1.7}}>
                <div style={{color:'var(--text-3)', fontSize:9.5, marginBottom:4, fontWeight:600}}>ADJ-2025-Q4 · 31 Des 2025</div>
                <div style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'2px 10px'}}>
                  <span>DR</span><span>Loss on Audit · 9101</span><span>14.200.000</span>
                  <span>DR</span><span>Accum. depreciation · 1601</span><span>8.400.000</span>
                  <span>CR</span><span>Fixed assets · IT 1501</span><span>9.400.000</span>
                  <span>CR</span><span>Fixed assets · Tools 1502</span><span>4.200.000</span>
                  <span>CR</span><span>Fixed assets · Furn 1503</span><span>9.000.000</span>
                </div>
              </div>
              <button className="btn btn-primary" style={{width:'100%', marginTop:10}} onClick={()=>toast('Journal entry posted to GL · finalizing Q4 close')}>Post to GL</button>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><div className="card-t">Sign-off · Audit report</div></div>
            <div className="card-b" style={{padding:0}}>
              {[
                {r:'Auditor Internal',     w:'Rahmat S.',  t:'28 Dec',  done:true},
                {r:'IT Asset Manager',     w:'Dewi A.',    t:'28 Dec',  done:true},
                {r:'Finance Manager',      w:'Ratna I.',   t:'29 Dec',  done:true},
                {r:'External Auditor',       w:'TM & Co',    t:'30 Dec',  done:true},
                {r:'CFO',                   w:'Surya D.',   t:'pending',done:false, current:true},
              ].map((s,i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderBottom: i<4?'1px solid var(--border-soft)':0}}>
                  <div style={{width:22, height:22, borderRadius:5, background: s.done?'var(--success-soft)':s.current?'var(--warn-soft)':'var(--surface-3)', color: s.done?'var(--success)':s.current?'var(--warn)':'var(--text-3)', display:'grid', placeItems:'center'}}>
                    {s.done ? <Icon n="check" s={11}/> : <Icon n="clock" s={11}/>}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:11.5, fontWeight:550}}>{s.r}</div>
                    <div style={{fontSize:10, color:'var(--text-3)'}}>{s.w} · {s.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   --- MAINTENANCE MODULE ---
   Sub-tabs:
     • Overview           — KPIs, critical alerts, health distribution
     • Work Orders        — CMMS WO list + detail (corrective + PM)
     • Asset Health & Age — age, last seen, days w/o maintenance, MTBF, score
     • Pre-Use Inspection — per-use QC (ban/tires, ladder, harness, fire ext)
     • PM Schedule        — calendar + recurring rules
   Best-practice signals tracked:
     1. Age (acquisition → today)            → straight-line depreciation, EOL planning
     2. Last seen (RFID gate / handheld)     → loss prevention + dormancy
     3. Days since last maintenance          → SLA / interval breach
     4. Days until next PM                   → preventive scheduling
     5. Cycles + hours run                   → usage-based PM trigger
     6. Health score (0-100)                 → composite of vibration / temp / failures
     7. Pre-use QC pass/fail                 → safety-critical lockout (ban, harness…)
============================================================ */

/* Maintenance mock data — purpose-built for age / last-seen / interval tracking */
const HEALTH_DATA = [
  {id:'MC-CN-0011', name:'Mazak QTN-200 CNC Lathe',     cat:'mach', loc:'Mfg-1 · Cell A',     custodian:'Eko P.',
   ageDays:1820, lastSeenLabel:'live · 2m',  lastSeenMin:2,   sinceMaintDays:24, nextPMDays:-6,  mtbfDays:312, healthScore:34, status:'critical',
   cycles:18420, runHours:6240, ai:'Spindle vibration +28% vs baseline'},
  {id:'VH-FK-0041', name:'Toyota Hilux 4x4 Forklift',   cat:'veh',  loc:'BDG-WH · Bay 2',     custodian:'Andi P.',
   ageDays:620,  lastSeenLabel:'18m',         lastSeenMin:18,  sinceMaintDays:42, nextPMDays:8,   mtbfDays:482, healthScore:68, status:'watch',
   cycles:2840,  runHours:1820, ai:'Hydraulic temp drift +4°C'},
  {id:'IT-SV-2240', name:'Dell PowerEdge R760 Server',  cat:'it',   loc:'JKT-DC · Rack B-12', custodian:'IT Ops',
   ageDays:180,  lastSeenLabel:'live',        lastSeenMin:0,   sinceMaintDays:12, nextPMDays:62,  mtbfDays:8420,healthScore:92, status:'ok',
   cycles:0,     runHours:4320, ai:'—'},
  {id:'LB-PH-0008', name:'Mettler PH Meter SevenExc.',  cat:'lab',  loc:'JKT-Lab · Station 3',custodian:'Dr. Ratna',
   ageDays:94,   lastSeenLabel:'1h',          lastSeenMin:60,  sinceMaintDays:184,nextPMDays:-2,  mtbfDays:0,   healthScore:58, status:'alert',
   cycles:1240,  runHours:0,    ai:'Calibration drift since last QC'},
  {id:'MD-EC-0021', name:'Philips IntelliVue MX450',    cat:'med',  loc:'RS Husada · ICU-2',  custodian:'Dr. Surya',
   ageDays:320,  lastSeenLabel:'8m',          lastSeenMin:8,   sinceMaintDays:6,  nextPMDays:24,  mtbfDays:1820,healthScore:96, status:'ok',
   cycles:0,     runHours:0,    ai:'—'},
  {id:'TL-DR-0142', name:'Hilti TE 6-A22 Hammer Drill', cat:'tool', loc:'JKT-Workshop · Crib',custodian:'Tool Crib',
   ageDays:62,   lastSeenLabel:'42m',         lastSeenMin:42,  sinceMaintDays:14, nextPMDays:46,  mtbfDays:128, healthScore:84, status:'ok',
   cycles:842,   runHours:184,  ai:'—'},
  {id:'IT-LP-9847', name:'MacBook Pro 16" M3 Max',      cat:'it',   loc:'JKT-HQ · Floor 8',   custodian:'Dewi A.',
   ageDays:14,   lastSeenLabel:'live',        lastSeenMin:0,   sinceMaintDays:0,  nextPMDays:351, mtbfDays:0,   healthScore:98, status:'ok',
   cycles:0,     runHours:240,  ai:'—'},
  {id:'FU-CH-0420', name:'Herman Miller Aeron Chair',   cat:'furn', loc:'JKT-HQ · Floor 8',   custodian:'Budi S.',
   ageDays:410,  lastSeenLabel:'4h',          lastSeenMin:240, sinceMaintDays:410,nextPMDays:0,   mtbfDays:0,   healthScore:88, status:'watch',
   cycles:0,     runHours:0,    ai:'Never serviced — armrest report'},
  {id:'TL-LA-0088', name:'Werner 28ft Ladder',          cat:'tool', loc:'BDG-WH · Tool Wall', custodian:'Tool Crib',
   ageDays:14,   lastSeenLabel:'3h',          lastSeenMin:180, sinceMaintDays:14, nextPMDays:76,  mtbfDays:0,   healthScore:90, status:'ok',
   cycles:0,     runHours:0,    ai:'Pre-use check required'},
  {id:'VH-VN-0006', name:'Suzuki APV Cargo Van',         cat:'veh',  loc:'JKT-Workshop',       custodian:'Andi P.',
   ageDays:980,  lastSeenLabel:'8h',          lastSeenMin:480, sinceMaintDays:91, nextPMDays:-12, mtbfDays:240, healthScore:42, status:'critical',
   cycles:18420, runHours:0,    ai:'Rear-left tire bald · pre-use FAIL'},
];

/* Pre-use inspection assets — per-use / per-shift QC. Critical = blocks RFID checkout if overdue. */
const PRE_USE_ASSETS = [
  {id:'VH-FK-0041', asset:'Toyota Hilux 4x4 Forklift',   cat:'veh',  interval:'Every shift (8h)', critical:true,
   checks:['Tire pressure · all 4','Hydraulic fluid level','Brake response','Seat-belt & alarm','Horn + indicator lights','Forks not bent'],
   lastCheckLabel:'14m ago', lastResult:'pass', lastChecker:'Andi P.', dueIn:'in 4h', overdue:false, streak:48},
  {id:'TL-LA-0088', asset:'Werner 28ft Extension Ladder',cat:'tool', interval:'Every use',  critical:true,
   checks:['Rungs intact','Foot pads not cracked','Spreader / locks','Safety labels legible','No deformation'],
   lastCheckLabel:'42m', lastResult:'pass', lastChecker:'Galang T.', dueIn:'on next pickup', overdue:false, streak:128},
  {id:'TL-FE-0210', asset:'Fire Extinguisher 9kg ABC',   cat:'tool', interval:'Monthly + annual',  critical:true,
   checks:['Pressure gauge in green zone','Pin seal intact','Hose not cracked','Fire-dept tag valid','Mounting bracket'],
   lastCheckLabel:'48 days', lastResult:'pass', lastChecker:'Safety Off.', dueIn:'-18 days (overdue)', overdue:true, streak:24},
  {id:'TL-HA-1024', asset:'Fall Arrest Harness · Petzl', cat:'tool', interval:'Every use + 6 months', critical:true,
   checks:['Webbing fraying','Stitching intact','Buckle functional','D-ring not corroded','Inspection tag valid','No chemical exposure'],
   lastCheckLabel:'2 days', lastResult:'pass', lastChecker:'Andi P.', dueIn:'next pickup', overdue:false, streak:84},
  {id:'VH-VN-0006', asset:'Suzuki APV Cargo Van',         cat:'veh',  interval:'Daily (pre-trip)',         critical:true,
   checks:['Tires (pressure + condition)','Engine oil & brakes','Headlights / signals','Wipers & horn','Radiator coolant','Registration + roadworthiness valid'],
   lastCheckLabel:'8h', lastResult:'fail', lastChecker:'Driver', dueIn:'BLOCKED · WO-2410-091', overdue:true, streak:0,
   failItem:'Rear-left tire bald — tread <1mm'},
  {id:'TL-DR-0142', asset:'Hilti TE 6-A22 Hammer Drill', cat:'tool', interval:'Pre-shift + return',  critical:false,
   checks:['Cord / battery insulation','Chuck locked','Trigger response','No overheating'],
   lastCheckLabel:'2m', lastResult:'pass', lastChecker:'Galang T.', dueIn:'on return', overdue:false, streak:62},
  {id:'TL-FB-0033', asset:'First Aid Kit · Wall',         cat:'med',  interval:'Monthly',              critical:true,
   checks:['Contents per SOP','Nothing expired','Seal intact','Logbook complete'],
   lastCheckLabel:'21 days', lastResult:'pass', lastChecker:'HSE', dueIn:'in 9 days', overdue:false, streak:36},
];

/* Recurring PM rules */
const PM_SCHEDULE = [
  {when:'Tomorrow',   date:'28 Jan', asset:'Dell PowerEdge R760', id:'IT-SV-2240', task:'Quarterly health check · firmware', who:'IT Ops',        eta:'2h',  type:'PM',         tone:'i'},
  {when:'3 days',  date:'30 Jan', asset:'CNC Mazak QTN-200',   id:'MC-CN-0011', task:'Bearing replacement (predictive)',   who:'Eko P.',        eta:'8h',  type:'Predictive', tone:'d'},
  {when:'6 days',  date:'02 Feb', asset:'Toyota Hilux Forklift',id:'VH-FK-0041',task:'500h service · oil + hydraulic',     who:'Maint. Team',    eta:'1d',  type:'Hours',      tone:'w'},
  {when:'12 days', date:'08 Feb', asset:'PH Meter SevenExc.',   id:'LB-PH-0008', task:'Annual calibration · ISO 17025',     who:'Dr. Ratna',     eta:'4h',  type:'Calibration',tone:''},
  {when:'18 days', date:'14 Feb', asset:'4× MacBook Pro Q1',    id:'IT-LP-batch',task:'Warranty expiring — renewal recommended',    who:'IT Ops',        eta:'—',   type:'Warranty',   tone:'w'},
  {when:'24 days', date:'20 Feb', asset:'Philips IntelliVue',   id:'MD-EC-0021', task:'Battery + electrode replacement',     who:'Med Eng',       eta:'3h',  type:'PM',         tone:''},
  {when:'42 days', date:'09 Mar', asset:'14× HVAC unit · F8',   id:'FAC-HVAC-F8',task:'Filter replacement · quarterly',     who:'Facilities',    eta:'1d',  type:'PM',         tone:''},
  {when:'62 days', date:'29 Mar', asset:'Fall Arrest Harness',  id:'TL-HA-1024', task:'6-month safety inspection',          who:'HSE',           eta:'1h',  type:'Inspection', tone:'i'},
];

const PM_RULES = [
  {name:'IT Equipment · Quarterly health',  trigger:'Every 90 days',          remind:'14d · 3d · 1d',  scope:'Server + Network',         autoWO:true,  tone:'i'},
  {name:'CNC + Heavy Machinery',                trigger:'500 cycles / 1000h',      remind:'90% · 100%',     scope:'Cell A, B, C',             autoWO:true,  tone:'p'},
  {name:'Vehicle Service',                  trigger:'Every 5,000 km / 6 months', remind:'500km · 100km',  scope:'14 kendaraan operasional', autoWO:true,  tone:'c'},
  {name:'Lab Instrument Calibration',        trigger:'Annual · ISO 17025',     remind:'60d · 30d · 7d', scope:'42 instruments',           autoWO:true,  tone:'s'},
  {name:'Medical Device Inspection',         trigger:'Every 6 months',          remind:'30d · 7d · 1d',  scope:'18 devices · Kemenkes',    autoWO:true,  tone:'d'},
  {name:'Fire Safety · APAR',               trigger:'Monthly + annual',       remind:'7d · 1d',         scope:'84 APAR site-wide',        autoWO:true,  tone:'w'},
  {name:'Fall Protection Harness',          trigger:'Every use + 6 months',    remind:'on RFID checkout',scope:'24 harness',                autoWO:true,  tone:'w'},
];

/* Tiny helpers */
const formatAge = (days) => {
  if (days < 30)  return days + 'd';
  if (days < 365) return Math.floor(days/30) + 'mo';
  const y = (days/365).toFixed(1);
  return y + 'y';
};
const formatDelta = (days) => {
  if (days === 0)    return ['today',         'w'];
  if (days > 0)      return ['in ' + days + 'd', days <= 7 ? 'w' : ''];
  return [Math.abs(days) + 'd overdue',           'd'];
};
const healthTone = (s) => s === 'critical' ? 'd' : s === 'alert' ? 'd' : s === 'watch' ? 'w' : 's';
const healthBarTone = (h) => h >= 80 ? 'success' : h >= 60 ? 'brand' : h >= 40 ? 'warn' : 'danger';

function MaintenancePage({navigate, toast, lang}){
  const [tab, setTab] = useState('flow');
  const [woOpen, setWoOpen] = useState(false);
  const en = lang === 'en';
  const T = (e, i) => en ? e : i;
  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">{T('Maintenance','Maintenance')}</h1>
          <p className="page-desc">
            {T(
              'Track every asset\'s health (age, last-seen, days since service), run Work Orders, and schedule regular inspections. All connected to Scan-In / Scan-Out / Transfer via RFID.',
              'Track kesehatan setiap aset (usia, last-seen, hari tanpa service), jalankan Work Order, dan jadwalkan inspeksi rutin. Semua terhubung ke Scan-In / Scan-Out / Mutasi via RFID.'
            )}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>{setTab('schedule'); toast(T('Schedule opened','Jadwal dibuka'));}}><Icon n="cal" s={13}/>{T('Schedule','Jadwal')}</button>
          <button className="btn btn-primary" onClick={()=>setWoOpen(true)}><Icon n="plus" s={13}/>{T('Create Work Order','Buat Work Order')}</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
        <Stat label={T('Open Work Orders','Open Work Orders')}   value="42"    sub={T('8 critical · 14 high','8 critical · 14 high')}             tone="warn"    icon="wrench"/>
        <Stat label={T('Overdue / Failed','Overdue / Gagal')}    value="8"     sub={T('6 PM overdue · 2 inspection fail','6 PM overdue · 2 inspeksi gagal')} tone="danger"  icon="alert"/>
        <Stat label={T('Dormant > 30d','Dormant > 30 hari')}     value="14"    sub={T('last RFID seen long ago','last RFID seen lama')}             tone="warn"    icon="radar"/>
        <Stat label={T('Fleet MTBF','MTBF Fleet')}                value="428h"  sub={T('+12h vs target','+12h vs target')}                            tone="success" icon="sparkles"/>
      </div>

      <div className="tabs">
        {[
          {id:'flow',     l:T('Flow & Alerts','Alur & Alert'),                       icon:'sparkles'},
          {id:'health',   l:T('Asset Health · Age','Health Aset · Usia'),            icon:'radar'},
          {id:'wo',       l:T('Work Orders · 42','Work Order · 42'),                  icon:'wrench'},
          {id:'schedule', l:T('Inspections & PM · 14','Inspeksi & PM · 14'),          icon:'cal'},
        ].map(t => (
          <button key={t.id} className={`tab ${tab===t.id?'on':''}`} onClick={()=>setTab(t.id)}>
            <span style={{display:'inline-flex', alignItems:'center', gap:7}}>
              <Icon n={t.icon} s={12}/>{t.l}
            </span>
          </button>
        ))}
      </div>

      {tab === 'flow'     && <MaintFlowOverview navigate={navigate} toast={toast} setTab={setTab} lang={lang}/>}
      {tab === 'health'   && <MaintAssetHealth navigate={navigate} toast={toast} lang={lang}/>}
      {tab === 'wo'       && <MaintWorkOrders navigate={navigate} toast={toast} lang={lang}/>}
      {tab === 'schedule' && <MaintInspectionPM navigate={navigate} toast={toast} lang={lang}/>}

      <WorkOrderModal open={woOpen} onClose={()=>setWoOpen(false)} toast={toast}/>
    </div>
  );
}

/* --- Flow & Alerts tab — lifecycle diagram + critical alerts --- */
function MaintFlowOverview({navigate, toast, setTab}){
  /* Each stage in the asset lifecycle. Clicking a stage routes to that module. */
  const stages = [
    {id:'in',  ic:'arrin',  tone:'s', t:'1 · SCAN-IN',  d:'Receiving',  page:'scan-in',
     bullets:['RFID tag printed & encoded (EPC)','Asset registered + custodian + location','First "in" event starts the asset AGE clock']},
    {id:'op',  ic:'radar',  tone:'i', t:'2 · OPERATE',  d:'Daily use',  page:'rtls',
     bullets:['Gate antennas update LAST-SEEN','Pre-use QC scan before use','Cycles + run-hours tick up automatically']},
    {id:'mt',  ic:'wrench', tone:'w', t:'3 · MAINTAIN', d:'Health & PM', page:null,
     bullets:['Track age, last-seen, days w/o service','PM rules auto-create Work Orders','On-site RFID scan auto-closes the WO']},
    {id:'out', ic:'swap',   tone:'p', t:'4 · TRANSFER / DISPOSE', d:'Move or retire', page:'transfer',
     bullets:['Custody updates on gate scan','Disposal WO → final scan-out','RFID tag deactivated, GL entry']},
  ];

  /* WO sources — to break "WO = maintenance only" mental model */
  const sources = [
    {ic:'wrench',  tone:'w', t:'Maintenance signal',       d:'PM due, AI predictive, or corrective'},
    {ic:'shield',  tone:'d', t:'Pre-use inspection FAIL',  d:'Safety item fails its check → auto-WO + checkout block'},
    {ic:'swap',    tone:'i', t:'Transfer request',         d:'Move N assets between locations → WO for the crew'},
    {ic:'arrout',  tone:'p', t:'Disposal',                  d:'Retire / scrap / sold → WO pickup + tag deact.'},
    {ic:'audit',   tone:'c', t:'Audit variance',           d:'Stock audit findings → investigation WO'},
  ];

  return (
    <div>
      {/* === LIFECYCLE DIAGRAM === */}
      <div className="card" style={{padding:18, marginBottom:14}}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, gap:14}}>
          <div>
            <div style={{fontSize:14, fontWeight:650, letterSpacing:'-0.01em'}}>How all the modules connect</div>
            <div style={{fontSize:11.5, color:'var(--text-2)', marginTop:3, maxWidth:680}}>
              Every asset moves through 4 stages. RFID is the "system of record" — each scan updates last-seen, run-hours, and custody.
              When a signal needs action (PM due, failed inspection, approved transfer), the system automatically creates a <b>Work Order</b>.
            </div>
          </div>
          <span className="b i dot">RFID-driven CMMS</span>
        </div>

        {/* Stage cards in a row */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 16px 1fr 16px 1fr 16px 1fr', alignItems:'stretch'}}>
          {stages.map((s,i) => (
            <React.Fragment key={s.id}>
              <button onClick={()=>s.page ? navigate(s.page) : setTab('schedule')}
                style={{padding:13, background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, textAlign:'left', cursor:'pointer', transition:'all .14s'}}
                onMouseEnter={(e)=>{e.currentTarget.style.borderColor='color-mix(in oklab, var(--brand) 30%, var(--border))'; e.currentTarget.style.transform='translateY(-1px)';}}
                onMouseLeave={(e)=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)';}}>
                <div style={{display:'flex', alignItems:'center', gap:9, marginBottom:9}}>
                  <div className={`ico ${s.tone}`} style={{width:32, height:32}}><Icon n={s.ic} s={14}/></div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:9.5, color:'var(--text-3)', fontWeight:600, letterSpacing:'.06em'}}>{s.t}</div>
                    <div style={{fontSize:13, fontWeight:650, marginTop:1}}>{s.d}</div>
                  </div>
                </div>
                {s.bullets.map((b,j)=>(
                  <div key={j} style={{fontSize:10.5, color:'var(--text-2)', display:'flex', gap:6, marginTop:4, lineHeight:1.4}}>
                    <span style={{color:'var(--brand-strong)', flexShrink:0}}>›</span><span>{b}</span>
                  </div>
                ))}
                {s.page && <div style={{fontSize:10, color:'var(--brand-strong)', fontWeight:600, marginTop:9, display:'flex', alignItems:'center', gap:3}}>Open module <Icon n="chev" s={9}/></div>}
                {!s.page && <div style={{fontSize:10, color:'var(--brand-strong)', fontWeight:600, marginTop:9}}>← You are here</div>}
              </button>
              {i < stages.length-1 && (
                <div style={{display:'grid', placeItems:'center'}}>
                  <Icon n="chev" s={18} c="var(--text-4)"/>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Connector lines down to WO bar */}
        <div style={{height:18, position:'relative', margin:'0 12.5%'}}>
          <svg width="100%" height="18" preserveAspectRatio="none" style={{display:'block'}}>
            <path d="M 12.5% 0 L 12.5% 9 L 87.5% 9 L 87.5% 18 M 37.5% 9 L 37.5% 18 M 62.5% 9 L 62.5% 18 M 12.5% 18" stroke="var(--border-strong)" strokeWidth="1.5" fill="none" strokeDasharray="3 3"/>
          </svg>
          <span style={{position:'absolute', left:'50%', top:0, transform:'translateX(-50%)', background:'var(--surface)', padding:'0 8px', fontSize:9.5, color:'var(--text-3)', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase'}}>
            All signals flow down to ↓
          </span>
        </div>

        {/* Work Order central bar */}
        <div style={{
          padding:'14px 16px',
          background:'linear-gradient(90deg, var(--brand-soft) 0%, color-mix(in oklab, var(--brand-soft) 50%, var(--surface-2)) 100%)',
          border:'1px solid color-mix(in oklab, var(--brand) 32%, var(--border))',
          borderRadius:8, display:'flex', alignItems:'center', gap:14
        }}>
          <div className="ico i" style={{width:40, height:40}}><Icon n="wrench" s={18}/></div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:650, color:'var(--brand-strong)', letterSpacing:'-0.005em'}}>WORK ORDER · execution layer</div>
            <div style={{fontSize:11.5, color:'var(--text-2)', marginTop:2, lineHeight:1.5}}>
              A WO is not only for maintenance. Every job a human must execute is tracked as a WO — with a
              <b> source</b> explaining where it came from. Techs pick from the queue → do the work → <b>scan RFID on site</b> → the WO auto-closes.
            </div>
          </div>
          <button className="btn btn-sm btn-primary" onClick={()=>setTab('wo')}>View queue · 42 <Icon n="chev" s={11}/></button>
        </div>

        {/* WO source chips */}
        <div style={{marginTop:14, display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8}}>
          {sources.map((s,i)=>(
            <div key={i} style={{padding:10, background:'var(--surface-2)', borderRadius:7, border:'1px solid var(--border-soft)'}}>
              <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:5}}>
                <div className={`ico ${s.tone}`} style={{width:22, height:22, borderRadius:4}}><Icon n={s.ic} s={11}/></div>
                <div style={{fontSize:11.5, fontWeight:600}}>{s.t}</div>
              </div>
              <div style={{fontSize:10.5, color:'var(--text-3)', lineHeight:1.4}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* === CRITICAL ALERTS + HEALTH DIST === */}
      <div style={{display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:14}}>
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Critical alerts · action needed</div>
              <div className="card-sub">Sorted by downtime risk × asset value · click to open</div>
            </div>
            <button className="btn btn-sm" onClick={()=>setTab('wo')}>WO queue <Icon n="chev" s={11}/></button>
          </div>
          <div style={{padding:0}}>
            {[
              {ic:'alert',  tone:'d', t:'CNC Mazak MC-0011 · spindle anomaly',     d:'Vibration +28% baseline · WO-2410-088 in-progress · 24d overdue PM', go:'wo'},
              {ic:'alert',  tone:'d', t:'Suzuki APV VN-0006 · rear tire bald', d:'Pre-use FAIL · BLOCKED from RFID checkout · WO-2410-091', go:'schedule'},
              {ic:'clock',  tone:'w', t:'PH Meter LB-0008 · calibration overdue',     d:'184 days without service · ISO 17025 interval 365d · -2d',              go:'health'},
              {ic:'shield', tone:'w', t:'Extinguisher FE-0210 · monthly inspection overdue',  d:'Last QC 48d ago (target 30d) · -18d · fire-safety audit risk',             go:'schedule'},
              {ic:'eye',    tone:'',  t:'14 assets dormant > 30 days',                  d:'Last RFID read long ago · zone sweep audit recommended',                    go:'health'},
            ].map((a,i) => (
              <div key={i} onClick={()=>setTab(a.go)} style={{display:'flex', alignItems:'center', gap:11, padding:'12px 16px',
                borderBottom: i<4?'1px solid var(--border-soft)':0, cursor:'pointer'}}>
                <div className={`ico ${a.tone}`} style={{width:30, height:30}}><Icon n={a.ic} s={13}/></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:600, fontSize:12.5}}>{a.t}</div>
                  <div style={{fontSize:11, color:'var(--text-2)', marginTop:2}}>{a.d}</div>
                </div>
                <Icon n="chev" s={12} c="var(--text-3)"/>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h"><div className="card-t">Health Score distribution</div><span className="b">10,774 assets</span></div>
          <div className="card-b">
            {[
              {l:'Healthy (80–100)',   n:8420, pct:78, tone:'success'},
              {l:'Watch (60–79)',       n:1842, pct:17, tone:'brand'},
              {l:'Alert (40–59)',       n:328,  pct:3,  tone:'warn'},
              {l:'Critical (< 40)',     n:184,  pct:2,  tone:'danger'},
            ].map((b,i)=>(
              <div key={i} style={{marginBottom:i<3?12:0}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:11.5, marginBottom:5}}>
                  <span style={{fontWeight:550}}>{b.l}</span>
                  <span className="mono" style={{color:'var(--text-3)'}}>{b.n.toLocaleString()} · {b.pct}%</span>
                </div>
                <Meter pct={b.pct*4} tone={b.tone}/>
              </div>
            ))}
            <div style={{marginTop:14, padding:11, background:'var(--surface-2)', borderRadius:7, fontSize:11, color:'var(--text-2)', lineHeight:1.5}}>
              <b style={{color:'var(--text)'}}>Health Score</b> = a composite of age, days without maintenance, MTBF, run-hours, and sensor signals (vibration, temp). 0–100.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Work Orders tab (with SOURCE badges to break "WO = maintenance only" mental model) --- */
function MaintWorkOrders({navigate, toast}){
  const [sel, setSel] = useState(0);
  const [woFilter, setWoFilter] = useState('All');
  /* Each WO carries a SOURCE — why this WO exists. Connects to the lifecycle stage that produced it. */
  const wos = [
    {id:'WO-2410-091', src:'inspection',  pr:'critical', asset:'Suzuki APV VN-0006',  cat:'veh',  issue:'Rear-left tire bald · pre-use FAIL',     tech:'Andi P.',   eta:'2h',  status:'open',         tone:'d'},
    {id:'WO-2410-088', src:'predictive',  pr:'critical', asset:'Mazak QTN-200 CNC',   cat:'mach', issue:'Spindle vibration anomaly · AI predictive', tech:'Eko P.',     eta:'4h',  status:'in-progress',  tone:'d'},
    {id:'WO-2410-090', src:'transfer',    pr:'high',     asset:'24× Workstation',     cat:'it',   issue:'Move from F8 to F12 · request DEW-241', tech:'Move Crew', eta:'1d',  status:'open',         tone:'w'},
    {id:'WO-2410-087', src:'corrective',  pr:'high',     asset:'Toyota Forklift 4x4', cat:'veh',  issue:'Hydraulic leak · left arm',                  tech:'Galang T.',  eta:'1d',  status:'in-progress',  tone:'w'},
    {id:'WO-2410-086', src:'corrective',  pr:'high',     asset:'Dell PowerEdge R760', cat:'it',   issue:'PSU 2 failure',                              tech:'IT Ops',     eta:'2h',  status:'in-progress',  tone:'w'},
    {id:'WO-2410-089', src:'audit',       pr:'med',      asset:'Aeron Chair · 4 missing',cat:'furn',issue:'Investigate F12 audit variance',             tech:'Auditor',    eta:'3d',  status:'open',         tone:''},
    {id:'WO-2410-085', src:'pm',          pr:'med',      asset:'Mettler PH Meter',    cat:'lab',  issue:'Annual calibration · ISO 17025',              tech:'Dr. Ratna',  eta:'today', status:'open',       tone:''},
    {id:'WO-2410-084', src:'pm',          pr:'med',      asset:'Philips IntelliVue',  cat:'med',  issue:'Battery replacement · PM',                    tech:'Med Eng',    eta:'today', status:'open',       tone:''},
    {id:'WO-2410-082', src:'disposal',    pr:'low',      asset:'18× retired laptops', cat:'it',   issue:'Pickup e-waste vendor · scan-out final',     tech:'IT Ops',     eta:'Wed', status:'open',         tone:''},
    {id:'WO-2410-083', src:'corrective',  pr:'low',      asset:'Aeron Chair',         cat:'furn', issue:'Armrest replacement',                        tech:'Facilities', eta:'Mon', status:'open',         tone:''},
  ];
  /* Source metadata — icon + tone + label for the badge */
  const SRC = {
    pm:         {ic:'cal',    tone:'i',  l:'PM scheduled',     full:'Preventive Maintenance · automatic recurring schedule'},
    predictive: {ic:'sparkles',tone:'d', l:'AI predictive',     full:'AI detects anomalies from sensors / telemetry'},
    corrective: {ic:'wrench', tone:'w',  l:'Corrective',         full:'Breakdown or damage report from the custodian'},
    inspection: {ic:'shield', tone:'d',  l:'Inspection FAIL',    full:'Pre-use safety check failed — checkout auto-blocked'},
    transfer:   {ic:'swap',   tone:'i',  l:'Transfer request',  full:'Move request · a crew job'},
    disposal:   {ic:'arrout', tone:'p',  l:'Disposal',            full:'Retire / scrap / sold — pickup + scan-out'},
    audit:      {ic:'audit',  tone:'c',  l:'Audit variance',     full:'Stock audit finding — needs investigation'},
  };
  const filtered = wos.filter(w => woFilter==='All' ? true : woFilter==='Maintenance' ? ['pm','predictive','corrective'].includes(w.src) : w.src===woFilter.toLowerCase());
  const w = filtered[Math.min(sel, filtered.length-1)];
  const srcMeta = w ? SRC[w.src] : null;
  return (
    <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14}}>
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">Work Order queue</div>
            <div className="card-sub">Every WO shows its <b>source</b> — what triggered the job</div>
          </div>
          <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
            {['All','Maintenance','Inspection','Transfer','Disposal','Audit'].map(f => (
              <button key={f} className={`chip ${woFilter===f?'on':''}`} onClick={()=>{setWoFilter(f); setSel(0);}}>{f}</button>
            ))}
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>WO</th><th>Source</th><th>Asset</th><th>Issue</th><th>Tech</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((r,i)=>{
              const s = SRC[r.src];
              return (
                <tr key={r.id} className={`row-link ${sel===i?'sel':''}`} onClick={()=>setSel(i)}>
                  <td>
                    <div className="mono" style={{fontSize:10.5, fontWeight:600}}>{r.id}</div>
                    <span className={`b ${r.tone||''}`} style={{fontSize:9, marginTop:2}}>{r.pr.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className={`b ${s.tone}`} style={{display:'inline-flex', gap:4}}>
                      <Icon n={s.ic} s={10}/>{s.l}
                    </span>
                  </td>
                  <td>
                    <div className="cell-asset">
                      <div className={`ico ${catTone[r.cat]}`} style={{width:26, height:26, borderRadius:5}}><Icon n={catIcon[r.cat]} s={11}/></div>
                      <div className="asset-name" style={{fontSize:12}}>{r.asset}</div>
                    </div>
                  </td>
                  <td style={{fontSize:11.5, color:'var(--text-2)'}}>{r.issue}</td>
                  <td><div style={{display:'flex', alignItems:'center', gap:6}}><Avatar name={r.tech} i={i} size={20}/><span style={{fontSize:11.5}}>{r.tech}</span></div></td>
                  <td><span className={`b ${r.status==='in-progress'?'w':''}`}>{r.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {w && (
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">{w.id} · Detail</div>
              <div className="card-sub">{w.asset}</div>
            </div>
            <span className={`b ${w.tone||''}`}>{w.pr.toUpperCase()}</span>
          </div>
          <div className="card-b">
            {/* SOURCE EXPLAINER — first thing you see */}
            <div style={{padding:11, background:`color-mix(in oklab, var(--${srcMeta.tone==='d'?'danger':srcMeta.tone==='w'?'warn':srcMeta.tone==='i'?'brand':srcMeta.tone==='c'?'cyan':srcMeta.tone==='p'?'purple':'success'}-soft) 80%, var(--surface-2))`,
                borderRadius:7, marginBottom:14, display:'flex', alignItems:'center', gap:10}}>
              <div className={`ico ${srcMeta.tone}`} style={{width:30, height:30, flexShrink:0}}><Icon n={srcMeta.ic} s={13}/></div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:600}}>WO created by</div>
                <div style={{fontSize:12, fontWeight:600, marginTop:1}}>{srcMeta.l}</div>
                <div style={{fontSize:10.5, color:'var(--text-2)', marginTop:2, lineHeight:1.4}}>{srcMeta.full}</div>
              </div>
            </div>

            <div style={{padding:11, background:'var(--surface-2)', borderRadius:7, fontSize:11.5, marginBottom:14}}>
              <div style={{fontWeight:600, marginBottom:3}}>Issue</div>
              <div style={{color:'var(--text-2)', lineHeight:1.5}}>{w.issue}</div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14}}>
              <Stat label="ETA close" value={w.eta} tone="warn"/>
              <Stat label="Cost est." value={formatIDRShort(23660000)} sub="parts + labor"/>
            </div>

            {/* Connected events — how this WO ties back to the lifecycle */}
            <div style={{fontSize:10.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>Connected events</div>
            <div style={{display:'grid', gap:5, marginBottom:14}}>
              {[
                {ic:'arrin',  l:'Scan-In',     d:'Asset received 14d ago'},
                {ic:'radar',  l:'Last seen',   d:'2m ago · gate JKT-HQ-G8'},
                {ic:'wrench', l:'Last WO',     d:'WO-2407-042 closed 24d ago'},
              ].map((e,i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', gap:9, padding:'6px 10px', background:'var(--surface-2)', borderRadius:6}}>
                  <Icon n={e.ic} s={12} c="var(--text-3)"/>
                  <span style={{fontSize:11, fontWeight:550, minWidth:70}}>{e.l}</span>
                  <span style={{fontSize:11, color:'var(--text-2)', flex:1}}>{e.d}</span>
                </div>
              ))}
            </div>

            <div style={{display:'flex', gap:6}}>
              <button className="btn" style={{flex:1}} onClick={()=>toast('Technician paged')}><Icon n="bell" s={12}/>Call tech</button>
              <button className="btn btn-primary" style={{flex:1}} onClick={()=>toast('WO complete · RFID auto-verify on next scan')}><Icon n="check" s={12}/>Complete</button>
            </div>

            <div style={{marginTop:12, padding:9, fontSize:10.5, color:'var(--text-3)', textAlign:'center', background:'var(--surface-2)', borderRadius:6}}>
              When the tech scans the asset on site after finishing → the WO auto-closes and the "days w/o maintenance" counter resets.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Asset Health tab — age, last seen, days w/o maint, MTBF, health score --- */
function MaintAssetHealth({navigate, toast}){
  const [filter, setFilter] = useState('all');
  const filtered = HEALTH_DATA.filter(r => filter==='all' ? true : filter==='dormant' ? r.lastSeenMin >= 60
                                       : filter==='nomaint' ? r.sinceMaintDays >= 60
                                       : filter==='pmdue' ? r.nextPMDays <= 7
                                       : r.status === filter);
  return (
    <div>
      <div className="card" style={{marginBottom:14}}>
        <div className="card-h">
          <div>
            <div className="card-t">Asset Health Tracker</div>
            <div className="card-sub">
              Every asset is tracked for age (acquisition → today), last RFID scan, days since last maintenance, PM schedule, and a composite health score.
              Click a row for asset detail.
            </div>
          </div>
          <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
            {[
              {id:'all',      l:'All'},
              {id:'critical', l:'Critical'},
              {id:'alert',    l:'Alert'},
              {id:'watch',    l:'Watch'},
              {id:'dormant',  l:'Dormant ≥1h'},
              {id:'nomaint',  l:'No maint ≥60d'},
              {id:'pmdue',    l:'PM ≤7d'},
            ].map(f => (
              <button key={f.id} className={`chip ${filter===f.id?'on':''}`} onClick={()=>setFilter(f.id)}>{f.l}</button>
            ))}
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Asset</th>
              <th style={{textAlign:'right'}}>Age</th>
              <th>Last seen</th>
              <th style={{textAlign:'right'}}>No maint.</th>
              <th>Next PM</th>
              <th style={{textAlign:'right'}}>Cycles · Hours</th>
              <th>MTBF</th>
              <th style={{minWidth:140}}>Health</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r,i)=>{
              const [pmTxt, pmTone] = formatDelta(r.nextPMDays);
              const sinceTone = r.sinceMaintDays >= 90 ? 'd' : r.sinceMaintDays >= 60 ? 'w' : '';
              const lastSeenTone = r.lastSeenMin >= 60*24 ? 'd' : r.lastSeenMin >= 60 ? 'w' : 's';
              return (
                <tr key={r.id} className="row-link" onClick={()=>navigate('detail', {assetId:r.id})}>
                  <td>
                    <div className="cell-asset">
                      <div className={`ico ${catTone[r.cat]}`} style={{width:30, height:30}}><Icon n={catIcon[r.cat]} s={13}/></div>
                      <div>
                        <div className="asset-name">{r.name}</div>
                        <div className="asset-id">{r.id} · {r.loc}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{textAlign:'right'}}>
                    <div className="mono" style={{fontWeight:600}}>{formatAge(r.ageDays)}</div>
                    <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{r.ageDays}d</div>
                  </td>
                  <td>
                    <span className={`b ${lastSeenTone} dot`}>{r.lastSeenLabel}</span>
                  </td>
                  <td style={{textAlign:'right'}}>
                    <span className={`b ${sinceTone}`}>{r.sinceMaintDays === 0 ? 'fresh' : r.sinceMaintDays + 'd'}</span>
                  </td>
                  <td>
                    <span className={`b ${pmTone}`}>{pmTxt}</span>
                  </td>
                  <td style={{textAlign:'right'}}>
                    <div className="mono" style={{fontSize:11.5, fontWeight:550}}>{r.cycles ? r.cycles.toLocaleString() : '—'}</div>
                    <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{r.runHours ? r.runHours+'h':'—'}</div>
                  </td>
                  <td>
                    <span className="mono" style={{fontSize:11.5}}>{r.mtbfDays ? r.mtbfDays + 'd' : '—'}</span>
                  </td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{flex:1, minWidth:60}}>
                        <Meter pct={r.healthScore} tone={healthBarTone(r.healthScore)}/>
                      </div>
                      <span className="mono" style={{fontSize:11.5, fontWeight:600, minWidth:22, textAlign:'right'}}>{r.healthScore}</span>
                    </div>
                    <div style={{fontSize:10, color:'var(--text-3)', marginTop:3}}>{r.ai}</div>
                  </td>
                  <td style={{textAlign:'right'}}>
                    <span className={`b ${healthTone(r.status)} dot`}>{r.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="tbl-foot">
          <span>Showing {filtered.length} assets · last RFID sync 2m ago</span>
          <div style={{display:'flex', gap:5}}>
            <button className="btn btn-sm" onClick={()=>toast('Export CSV · asset health')}><Icon n="dl" s={11}/>CSV</button>
            <button className="btn btn-sm" onClick={()=>toast('Sweep audit triggered for dormant assets')}><Icon n="radar" s={11}/>Sweep dormant</button>
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14}}>
        <div className="card card-b" style={{padding:16}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
            <div className="ico c" style={{width:32, height:32}}><Icon n="clock" s={14}/></div>
            <div>
              <div className="card-t">How "Age" is calculated</div>
              <div className="card-sub">Acquisition date → today</div>
            </div>
          </div>
          <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.55}}>
            Commissioning date is set at <b>Scan-In · Receiving</b> and updates automatically. For assets outside PSAK 16
            (lifetime &lt; 1 yr), age is used for lifecycle planning &amp; CapEx budgeting.
          </div>
        </div>
        <div className="card card-b" style={{padding:16}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
            <div className="ico i" style={{width:32, height:32}}><Icon n="radar" s={14}/></div>
            <div>
              <div className="card-t">"Last seen" via RFID</div>
              <div className="card-sub">Gate antenna + handheld scan</div>
            </div>
          </div>
          <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.55}}>
            Every time a tag is read at a gate / handheld, the timestamp + location are stored. <b>Dormant &gt; 30 days</b> auto-triggers a sweep audit at the last-known location.
          </div>
        </div>
        <div className="card card-b" style={{padding:16}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
            <div className="ico w" style={{width:32, height:32}}><Icon n="wrench" s={14}/></div>
            <div>
              <div className="card-t">"Days w/o maintenance"</div>
              <div className="card-sub">Days since last WO closed</div>
            </div>
          </div>
          <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.55}}>
            The counter resets when a WO completes with on-site RFID verification. Thresholds per category (machinery 60d, lab 180d, IT 90d). Past the threshold → auto-create WO + notify the PIC.
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Pre-Use Inspection tab --- */
/* --- Combined Inspection & PM tab --- 
   Keduanya = "scheduled prevention". Bedanya:
   - Pre-Use Inspection: cek setiap pakai (ban, ladder, harness, APAR)
   - Scheduled PM:       cek pada interval kalender / cycles / run-hours
*/
function MaintInspectionPM({navigate, toast}){
  const [view, setView] = useState('inspect');
  return (
    <div>
      <div style={{display:'flex', gap:10, marginBottom:14, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap'}}>
        <div className="pill-group">
          <button className={view==='inspect'?'on':''} onClick={()=>setView('inspect')}>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><Icon n="shield" s={11}/>Pre-Use Inspection · 7</span>
          </button>
          <button className={view==='pm'?'on':''} onClick={()=>setView('pm')}>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><Icon n="cal" s={11}/>Scheduled PM · 8</span>
          </button>
        </div>
        <div style={{fontSize:11, color:'var(--text-3)', maxWidth:520, textAlign:'right'}}>
          Both are <b style={{color:'var(--text-2)'}}>prevention</b>. Inspection = every use (tires, ladders, harnesses, extinguishers). PM = scheduled intervals (calendar / cycles / run-hours).
        </div>
      </div>

      {view === 'inspect' && <PreUseInspectionView toast={toast}/>}
      {view === 'pm'      && <PMScheduleView navigate={navigate} toast={toast}/>}

      {/* Best practices — shared footer */}
      <div className="card card-b" style={{padding:16, marginTop:14, background:'linear-gradient(180deg, var(--surface) 0%, color-mix(in oklab, var(--surface) 92%, var(--brand-soft)) 100%)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <div className="ico i" style={{width:30, height:30}}><Icon n="sparkles" s={14}/></div>
          <div style={{fontWeight:600, fontSize:13}}>Best practices · what to track</div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10}}>
          {[
            {ic:'clock',   t:'Time-based PM',     d:'Calendar intervals (90/180/365d). Default for lab, medical, safety.'},
            {ic:'sparkles',t:'Usage-based PM',    d:'Triggered by cycles / run-hours. For CNC, forklifts, generators.'},
            {ic:'radar',   t:'Predictive (AI)',   d:'IoT sensors + RFID anchors. Highest ROI on critical assets.'},
            {ic:'shield',  t:'Pre-use Inspection',d:'Mandatory: tires, ladders, harnesses, extinguishers, first-aid. RFID gate lockout on fail.'},
            {ic:'check',   t:'Compliance audit',  d:'ISO 17025, SMK3, MoH. Immutable audit trail in the EPCIS log.'},
            {ic:'cog',     t:'Condition-based',   d:'Threshold triggers (temp, vibration). Telemetry + RFID combined.'},
          ].map((b,i)=>(
            <div key={i} style={{padding:10, background:'var(--surface-2)', borderRadius:7, border:'1px solid var(--border-soft)'}}>
              <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:5}}>
                <div className="ico i" style={{width:22, height:22, borderRadius:5}}><Icon n={b.ic} s={10}/></div>
                <div style={{fontWeight:600, fontSize:11.5}}>{b.t}</div>
              </div>
              <div style={{fontSize:10.5, color:'var(--text-2)', lineHeight:1.5}}>{b.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Pre-Use Inspection view (extracted) */
function PreUseInspectionView({toast}){
  const [sel, setSel] = useState(0);
  const a = PRE_USE_ASSETS[sel];
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:14}}>
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">Inspection-required assets · 7 catalogued</div>
            <div className="card-sub">RFID checkout BLOCKED when overdue / FAIL · K3 / ISO 45001</div>
          </div>
          <span className="b w dot">2 blocked</span>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Asset</th><th>Interval</th><th>Last check</th><th>Status</th></tr>
          </thead>
          <tbody>
            {PRE_USE_ASSETS.map((r,i)=>(
              <tr key={r.id} className={`row-link ${sel===i?'sel':''}`} onClick={()=>setSel(i)}>
                <td>
                  <div className="cell-asset">
                    <div className={`ico ${catTone[r.cat]}`} style={{width:28, height:28, borderRadius:5}}><Icon n={catIcon[r.cat]} s={12}/></div>
                    <div>
                      <div className="asset-name" style={{fontSize:12}}>{r.asset}</div>
                      <div className="asset-id">{r.id} {r.critical && <span style={{color:'var(--danger)', marginLeft:4}}>● K3</span>}</div>
                    </div>
                  </div>
                </td>
                <td style={{fontSize:11.5, color:'var(--text-2)'}}>{r.interval}</td>
                <td>
                  <div style={{fontSize:11.5}}>{r.lastCheckLabel}</div>
                  <div style={{fontSize:10, color:'var(--text-3)'}}>by {r.lastChecker}</div>
                </td>
                <td>
                  {r.lastResult === 'pass' && <span className={`b s dot`}>PASS</span>}
                  {r.lastResult === 'fail' && <span className={`b d dot`}>FAIL</span>}
                  {r.overdue && r.lastResult==='pass' && <div><span className={`b w dot`} style={{marginTop:3}}>OVERDUE</span></div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">{a.asset}</div>
            <div className="card-sub">{a.id} · {a.interval}</div>
          </div>
          <span className={`b ${a.overdue ? 'd' : 's'} dot`}>{a.overdue ? 'INSPECTION DUE' : 'COMPLIANT'}</span>
        </div>
        <div className="card-b">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14}}>
            <div style={{padding:10, background:'var(--surface-2)', borderRadius:7}}>
              <div style={{fontSize:9.5, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Last check</div>
              <div className="mono" style={{fontSize:13, fontWeight:600, marginTop:3}}>{a.lastCheckLabel}</div>
              <div style={{fontSize:10, color:'var(--text-3)'}}>{a.lastChecker}</div>
            </div>
            <div style={{padding:10, background:'var(--surface-2)', borderRadius:7}}>
              <div style={{fontSize:9.5, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Due</div>
              <div className="mono" style={{fontSize:13, fontWeight:600, marginTop:3, color: a.overdue?'var(--danger)':'var(--text)'}}>{a.dueIn}</div>
              <div style={{fontSize:10, color:'var(--text-3)'}}>{a.lastResult.toUpperCase()}</div>
            </div>
            <div style={{padding:10, background:'var(--surface-2)', borderRadius:7}}>
              <div style={{fontSize:9.5, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Pass streak</div>
              <div className="mono" style={{fontSize:13, fontWeight:600, marginTop:3, color: a.streak>0?'var(--success)':'var(--danger)'}}>{a.streak}× pass</div>
              <div style={{fontSize:10, color:'var(--text-3)'}}>no fails</div>
            </div>
          </div>

          {a.failItem && (
            <div style={{padding:11, background:'var(--danger-soft)', border:'1px solid rgba(239,68,68,.25)', borderRadius:7, marginBottom:14, display:'flex', gap:9, alignItems:'flex-start'}}>
              <Icon n="alert" s={14} c="var(--danger)"/>
              <div style={{fontSize:11.5}}>
                <div style={{fontWeight:600, color:'var(--danger)'}}>Critical finding · checkout BLOCKED</div>
                <div style={{color:'var(--text-2)', marginTop:2}}>{a.failItem}</div>
              </div>
            </div>
          )}

          <div style={{fontSize:10.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>
            Checklist · {a.checks.length} items
          </div>
          <div style={{display:'grid', gap:5}}>
            {a.checks.map((c,i)=>{
              const fail = a.failItem && (a.failItem.toLowerCase().includes('tire') && c.toLowerCase().includes('tire'));
              return (
                <div key={i} style={{display:'flex', alignItems:'center', gap:9, padding:'7px 10px', background:'var(--surface-2)', borderRadius:6}}>
                  <div style={{width:18, height:18, borderRadius:4, background: fail?'var(--danger-soft)':'var(--success-soft)', color: fail?'var(--danger)':'var(--success)', display:'grid', placeItems:'center'}}>
                    <Icon n={fail?'x':'check'} s={11}/>
                  </div>
                  <span style={{fontSize:11.5, flex:1}}>{c}</span>
                  {fail && <span className="b d" style={{fontSize:9}}>FAIL</span>}
                </div>
              );
            })}
          </div>

          <div style={{display:'flex', gap:6, marginTop:14}}>
            <button className="btn" style={{flex:1}} onClick={()=>toast('Starting inspection · scan the RFID tag')}><Icon n="qr" s={12}/>Scan & inspect</button>
            <button className="btn btn-primary" style={{flex:1}} onClick={()=>toast('Inspection history opened')}><Icon n="doc" s={12}/>History</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* PM Schedule view (extracted) */
function PMScheduleView({navigate, toast}){
  return (
    <div style={{display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:14}}>
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">PM schedule · next 60 days</div>
            <div className="card-sub">Generated from rules · click to open the WO</div>
          </div>
          <button className="btn btn-sm" onClick={()=>toast('Exported .ics to calendar')}><Icon n="dl" s={11}/>.ics</button>
        </div>
        <div style={{padding:0}}>
          {PM_SCHEDULE.map((p,i)=>(
            <div key={i} onClick={()=>toast(`Opening WO for ${p.id}`)} style={{
              display:'grid', gridTemplateColumns:'76px 1fr auto', gap:12, padding:'12px 16px',
              borderBottom: i<PM_SCHEDULE.length-1 ? '1px solid var(--border-soft)' : 0, cursor:'pointer', alignItems:'center'
            }}>
              <div>
                <div className="mono" style={{fontSize:11, color:'var(--brand-strong)', fontWeight:600}}>{p.when}</div>
                <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{p.date}</div>
              </div>
              <div style={{minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:2}}>
                  <span style={{fontWeight:600, fontSize:12.5}}>{p.asset}</span>
                  <span className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{p.id}</span>
                </div>
                <div style={{fontSize:11, color:'var(--text-2)'}}>{p.task}</div>
                <div style={{fontSize:10, color:'var(--text-3)', marginTop:2}}>{p.who} · ETA {p.eta}</div>
              </div>
              <span className={`b ${p.tone||''}`}>{p.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">Reminder Rules · auto-create WO</div>
            <div className="card-sub">7 active rules · time / cycles / run-hours triggers</div>
          </div>
          <button className="btn btn-sm" onClick={()=>navigate('settings')}><Icon n="cog" s={11}/>Edit</button>
        </div>
        <div style={{padding:0}}>
          {PM_RULES.map((r,i)=>(
            <div key={i} style={{padding:'12px 16px', borderBottom: i<PM_RULES.length-1 ? '1px solid var(--border-soft)' : 0,
              display:'flex', alignItems:'center', gap:10}}>
              <div className={`ico ${r.tone||''}`} style={{width:30, height:30}}><Icon n="cal" s={13}/></div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:12.5}}>{r.name}</div>
                <div style={{fontSize:10.5, color:'var(--text-3)', marginTop:2}}>
                  <b>Trigger:</b> {r.trigger} · <b>Remind:</b> {r.remind}
                </div>
                <div style={{fontSize:10.5, color:'var(--text-3)'}}><b>Scope:</b> {r.scope}</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end'}}>
                {r.autoWO && <span className="b i">auto-WO</span>}
                <span className="b s dot" style={{fontSize:9}}>ON</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- MASTER DATA --- */
function MasterDataPage({navigate, toast}){
  const [tab, setTab] = useState('cat');
  const addRef = useRef(null);
  const tabs = [
    {id:'cat',  l:'Category',     icon:'box',     n:'7 groups · 24 sub'},
    {id:'loc',  l:'Location',       icon:'pin',     n:'12 sites · 84 zones'},
    {id:'cust', l:'Custodian',    icon:'user',    n:'142 users'},
    {id:'cc',   l:'Cost Center',  icon:'dollar',  n:'28'},
    {id:'sup',  l:'Supplier',      icon:'truck',   n:'68'},
    {id:'cls',  l:'Asset Class',    icon:'tag',     n:'14 · PSAK 16'},
  ];
  const tabLabel = tabs.find(t=>t.id===tab)?.l || 'Category';
  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Master Data</h1>
          <p className="page-desc">Reference hub · categories, locations, custodians, cost centers, suppliers, asset classes · auto-synced to Accurate / Odoo / SAP.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast('Import CSV master data · ' + tabLabel.toLowerCase())}><Icon n="up" s={13}/>Import CSV</button>
          <button className="btn btn-primary" onClick={()=>addRef.current && addRef.current()}><Icon n="plus" s={13}/>Add {tabLabel}</button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t=>(
          <button key={t.id} className={`tab ${tab===t.id?'on':''}`} onClick={()=>setTab(t.id)}>
            <span style={{display:'inline-flex', alignItems:'center', gap:7}}>
              <Icon n={t.icon} s={12}/>
              {t.l}
              <span style={{fontSize:10, color:'var(--text-3)', fontWeight:500}}>{t.n}</span>
            </span>
          </button>
        ))}
      </div>

      {tab === 'cat'  && <MasterDataCategories  toast={toast} addRef={addRef}/>}
      {tab === 'loc'  && <MasterDataLocations   toast={toast} addRef={addRef}/>}
      {tab === 'cust' && <MasterDataCustodians  toast={toast} addRef={addRef}/>}
      {tab === 'cc'   && <MasterDataCostCenters toast={toast} addRef={addRef}/>}
      {tab === 'sup'  && <MasterDataSuppliers   toast={toast} addRef={addRef}/>}
      {tab === 'cls'  && <MasterDataClasses     toast={toast} addRef={addRef}/>}
    </div>
  );
}

function MasterDataLocations({toast, addRef}){
  const [sel, setSel] = useState('JKT-HQ');
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const blankAdd = {code:'', name:'', city:'', pic:'Bambang W.', parent:'JKT'};
  const [addForm, setAddForm] = useState(blankAdd);
  const [edit, setEdit] = useState({addr:'Jl. Sudirman Kav.5', city:'Jakarta Pusat 10250', pic:'Bambang W.'});
  useEffect(()=>{ if(addRef) addRef.current = ()=>{ setAddForm(blankAdd); setAddOpen(true); }; }, [addRef]);
  const tree = [
    {l:0, p:'JKT', n:'Jakarta · Headquarters', cnt:'8,420', icon:'building'},
    {l:1, p:'JKT-HQ', n:'JKT-HQ · Gedung Utama', cnt:'4,820'},
    {l:2, p:'JKT-HQ-F4', n:'Floor 4 · Marketing', cnt:'420'},
    {l:2, p:'JKT-HQ-F8', n:'Floor 8 · Engineering', cnt:'1,420'},
    {l:2, p:'JKT-HQ-F12',n:'Floor 12 · Sales', cnt:'820'},
    {l:1, p:'JKT-DC', n:'JKT Data Center', cnt:'142'},
    {l:1, p:'JKT-WS', n:'JKT Workshop · Sunter', cnt:'484'},
    {l:0, p:'BDG', n:'Bandung Office', cnt:'1,840', icon:'building'},
    {l:1, p:'BDG-OFF', n:'BDG Office · Floor 1-3', cnt:'1,420'},
    {l:1, p:'BDG-WH', n:'BDG Warehouse', cnt:'420'},
    {l:0, p:'MDN', n:'Medan · Branch', cnt:'420', icon:'building'},
    {l:0, p:'SBY', n:'Surabaya · Branch', cnt:'380', icon:'building'},
    {l:0, p:'DPS', n:'Denpasar · Branch', cnt:'260', icon:'building'},
  ];
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr', gap:14}}>
      <div className="card">
        <div className="card-h"><div className="card-t">Location hierarchy</div></div>
        <div style={{padding:'10px 14px'}}>
          {tree.map((c,i)=>(
            <div key={i} onClick={()=>setSel(c.p)}
              style={{display:'flex', alignItems:'center', gap:6, padding:'6px 8px', borderRadius:5, marginLeft:c.l*16,
                background: sel===c.p ? 'var(--brand-soft)' : 'transparent', cursor:'pointer', marginBottom:1}}>
              <Icon n="chev" s={9} style={{opacity:c.l<2?1:0, transform:'rotate(90deg)'}}/>
              <Icon n={c.icon||'pin'} s={12}/>
              <span style={{flex:1, fontSize:12, fontWeight: sel===c.p?650:550, color: sel===c.p?'var(--brand-strong)':'var(--text)'}}>{c.n}</span>
              <span className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{c.cnt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><div className="card-t">Zone &amp; gates · JKT-HQ</div><span className="b">14 zones</span></div>
        <div style={{padding:0}}>
          {[
            {n:'Lobby · Reception',     g:'Gate-1',  type:'public', cnt:24,  rfid:'4 antennas'},
            {n:'Floor 8 · Engineering', g:'Gate-8N',  type:'office', cnt:142, rfid:'8 antennas'},
            {n:'Floor 12 · Sales',      g:'Gate-12N', type:'office', cnt:94,  rfid:'6 antennas'},
            {n:'IT Closet · F8',         g:'Gate-IT',  type:'secure', cnt:48,  rfid:'2 antennas'},
            {n:'Data Center',            g:'Gate-DC',  type:'high-value', cnt:142, rfid:'8 antennas'},
            {n:'Workshop',               g:'Gate-WS',  type:'industrial', cnt:284, rfid:'12 antennas'},
          ].map((z,i)=>(
            <div key={i} style={{padding:'11px 14px', borderBottom: i<5?'1px solid var(--border-soft)':0, display:'flex', alignItems:'center', gap:10}}>
              <div className={`ico ${z.type==='high-value'?'d':z.type==='secure'?'w':z.type==='industrial'?'p':'i'}`} style={{width:28, height:28, borderRadius:6}}><Icon n="pin" s={12}/></div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:12}}>{z.n}</div>
                <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{z.g} · {z.rfid}</div>
              </div>
              <span className="b">{z.cnt} assets</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><div className="card-t">Detail · JKT-HQ</div><button className="btn btn-sm" onClick={()=>setEditOpen(true)}>Edit</button></div>
        <div className="card-b">
          <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'5px 12px', fontSize:11.5}}>
            <span style={{color:'var(--text-3)'}}>Code</span><b className="mono">JKT-HQ-01</b>
            <span style={{color:'var(--text-3)'}}>Address</span><b>{edit.addr}</b>
            <span style={{color:'var(--text-3)'}}>City</span><b>{edit.city}</b>
            <span style={{color:'var(--text-3)'}}>PIC</span><b>{edit.pic}</b>
            <span style={{color:'var(--text-3)'}}>Floor area</span><b className="mono">8.420 m²</b>
            <span style={{color:'var(--text-3)'}}>Total assets</span><b className="mono">4.820</b>
            <span style={{color:'var(--text-3)'}}>Total value</span><b className="mono" style={{color:'var(--cyan)'}}>{formatIDRShort(6800000000)}</b>
            <span style={{color:'var(--text-3)'}}>RFID coverage</span><b className="mono">98%</b>
            <span style={{color:'var(--text-3)'}}>Insurance</span><b>Allianz P-2024-MX · active</b>
          </div>

          <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:14, marginBottom:8}}>RFID coverage</div>
          <Meter pct={98} tone="success"/>
          <div style={{fontSize:10.5, color:'var(--text-3)', marginTop:4}}>14 zones · 40 antennas · 12 gates</div>
        </div>
      </div>

      <Modal open={editOpen} onClose={()=>setEditOpen(false)} title="Edit location · JKT-HQ" sub="Update location details"
        footer={<><button className="btn" onClick={()=>setEditOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={()=>{ setEditOpen(false); toast('Location updated · JKT-HQ'); }}><Icon n="check" s={12}/>Save</button></>}>
        <Field label="Address" value={edit.addr} onChange={v=>setEdit(e=>({...e, addr:v}))}/>
        <FieldRow>
          <Field label="City" value={edit.city} onChange={v=>setEdit(e=>({...e, city:v}))}/>
          <Field label="PIC" type="select" value={edit.pic} onChange={v=>setEdit(e=>({...e, pic:v}))}
            options={['Bambang W.','Dewi A.','Rahmat S.','Andi P.']}/>
        </FieldRow>
      </Modal>

      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add location" sub="New site, building, or zone"
        footer={<><button className="btn" onClick={()=>setAddOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={()=>{ if(!addForm.name.trim()||!addForm.code.trim()){ toast('Location code & name are required'); return; } setAddOpen(false); toast('Location added · ' + addForm.code); }}><Icon n="check" s={12}/>Save</button></>}>
        <FieldRow>
          <Field label="Code" req value={addForm.code} onChange={v=>setAddForm(f=>({...f, code:v}))} placeholder="JKT-XX-01"/>
          <Field label="Parent" type="select" value={addForm.parent} onChange={v=>setAddForm(f=>({...f, parent:v}))}
            options={['JKT','BDG','MDN','SBY','DPS','(top level)']}/>
        </FieldRow>
        <Field label="Location name" req value={addForm.name} onChange={v=>setAddForm(f=>({...f, name:v}))} placeholder="e.g. Floor 9 · Product"/>
        <FieldRow>
          <Field label="City" value={addForm.city} onChange={v=>setAddForm(f=>({...f, city:v}))} placeholder="Jakarta"/>
          <Field label="PIC" type="select" value={addForm.pic} onChange={v=>setAddForm(f=>({...f, pic:v}))}
            options={['Bambang W.','Dewi A.','Rahmat S.','Andi P.']}/>
        </FieldRow>
      </Modal>
    </div>
  );
}

function MasterDataCustodians({toast, addRef}){
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([
    {n:'Dewi Anggraini',   r:'Custodian',          dept:'Engineering',     assets:18, loc:'JKT-HQ · F8'},
    {n:'Rahmat Santoso',   r:'Supervisor',         dept:'Warehouse JKT',   assets:142,loc:'JKT-WH'},
    {n:'Andi Pratama',     r:'Maintenance Tech',   dept:'Operations',      assets:12, loc:'JKT-WS'},
    {n:'Budi Setiawan',    r:'Custodian',          dept:'Design',          assets:14, loc:'JKT-HQ · F12'},
    {n:'Dr. Ratna Indira', r:'Lab Manager',        dept:'R&D Lab',         assets:62, loc:'JKT-Lab'},
    {n:'Eko Pranata',      r:'Mechanical Lead',    dept:'Manufacturing',   assets:38, loc:'Mfg-1'},
    {n:'Galang Tirta',     r:'Asst. Technician',   dept:'Maintenance',     assets:8,  loc:'JKT-WS'},
    {n:'Citra Wijaya',     r:'IT Helpdesk',        dept:'IT Ops',          assets:24, loc:'JKT-HQ · F12'},
    {n:'Dr. Surya Dharma', r:'Medical Director',   dept:'RS Husada',       assets:42, loc:'RS Husada · ICU'},
  ]);
  const blank = {n:'', r:'Custodian', dept:'Engineering', loc:'JKT-HQ · F8'};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  useEffect(()=>{ if(addRef) addRef.current = ()=>{ setForm(blank); setOpen(true); }; }, [addRef]);

  const save = () => {
    if(!form.n.trim()){ toast('Custodian name is required'); return; }
    setRows(r => [{...form, assets:0}, ...r]);
    setOpen(false);
    toast('Custodian added · ' + form.n);
  };
  const users = q ? rows.filter(u => (u.n+u.r+u.dept+u.loc).toLowerCase().includes(q.toLowerCase())) : rows;
  return (
    <div className="card">
      <div className="card-h">
        <div className="card-t">Custodians · {rows.length} people</div>
        <div style={{display:'flex', gap:6}}>
          <div className="tb-search" style={{height:30, maxWidth:240, padding:'4px 10px'}}>
            <Icon n="search" s={12}/>
            <input placeholder="Search custodians…" value={q} onChange={e=>setQ(e.target.value)} style={{fontSize:11.5}}/>
          </div>
          <button className="btn btn-sm btn-primary" onClick={()=>{ setForm(blank); setOpen(true); }}><Icon n="plus" s={11}/>Add custodian</button>
        </div>
      </div>
      <table className="tbl">
        <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Default location</th><th style={{textAlign:'right'}}>Assets</th><th></th></tr></thead>
        <tbody>
          {users.map((u,i)=>(
            <tr key={i} className="row-link">
              <td>
                <div style={{display:'flex', alignItems:'center', gap:9}}>
                  <Avatar name={u.n} i={i} size={26}/>
                  <div>
                    <div style={{fontWeight:600, fontSize:12.5}}>{u.n}</div>
                    <div style={{fontSize:10, color:'var(--text-3)'}}>{u.n.toLowerCase().split(' ').join('.')}@indojaya.id</div>
                  </div>
                </div>
              </td>
              <td><span className="b i">{u.r}</span></td>
              <td style={{fontSize:12, color:'var(--text-2)'}}>{u.dept}</td>
              <td style={{fontSize:12, color:'var(--text-2)'}}>{u.loc}</td>
              <td className="mono" style={{textAlign:'right', fontWeight:600}}>{u.assets}</td>
              <td><Icon n="chev" s={13}/></td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={open} onClose={()=>setOpen(false)} title="Add custodian" sub="The person responsible for assets"
        footer={<><button className="btn" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={save}><Icon n="check" s={12}/>Save</button></>}>
        <Field label="Full name" req value={form.n} onChange={v=>setForm(f=>({...f, n:v}))} placeholder="Employee name"/>
        <FieldRow>
          <Field label="Role" type="select" value={form.r} onChange={v=>setForm(f=>({...f, r:v}))}
            options={['Custodian','Supervisor','Maintenance Tech','Lab Manager','IT Helpdesk','Medical Director']}/>
          <Field label="Department" type="select" value={form.dept} onChange={v=>setForm(f=>({...f, dept:v}))}
            options={['Engineering','Operations','Design','R&D Lab','Manufacturing','IT Ops','Maintenance','RS Husada']}/>
        </FieldRow>
        <Field label="Default location" type="select" value={form.loc} onChange={v=>setForm(f=>({...f, loc:v}))}
          options={['JKT-HQ · F8','JKT-HQ · F12','JKT-WH','JKT-WS','JKT-Lab','Mfg-1','RS Husada · ICU']}/>
      </Modal>
    </div>
  );
}

function MasterDataCostCenters({toast, addRef}){
  const [ccs, setCcs] = useState([
    {code:'CC-ENG-001', name:'Engineering',       pic:'Bambang W.',  budget:840000000,  spent:520000000, assets:184, depr:84000000},
    {code:'CC-DSN-001', name:'Design',             pic:'Lia R.',       budget:480000000,  spent:280000000, assets:62,  depr:24000000},
    {code:'CC-OPS-001', name:'Operations',         pic:'Andi P.',      budget:1240000000, spent:880000000, assets:284, depr:142000000},
    {code:'CC-MFG-001', name:'Manufacturing',     pic:'Eko P.',       budget:3800000000, spent:2400000000,assets:48,  depr:312000000},
    {code:'CC-RND-001', name:'R&D · Lab',          pic:'Dr. Ratna',    budget:680000000,  spent:380000000, assets:62,  depr:62000000},
    {code:'CC-SLS-001', name:'Sales',               pic:'Surya D.',     budget:340000000,  spent:140000000, assets:48,  depr:18000000},
    {code:'CC-FIN-001', name:'Finance & Admin',   pic:'Ratna I.',     budget:240000000,  spent:120000000, assets:62,  depr:14000000},
  ]);
  const blank = {code:'', name:'', pic:'Bambang W.', budget:'', gl:''};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  useEffect(()=>{ if(addRef) addRef.current = ()=>{ setForm(blank); setOpen(true); }; }, [addRef]);
  const save = () => {
    if(!form.name.trim() || !form.code.trim()){ toast('Cost center code & name are required'); return; }
    setCcs(c => [{code:form.code, name:form.name, pic:form.pic, budget:Number(form.budget)||0, spent:0, assets:0, depr:0}, ...c]);
    setOpen(false);
    toast('Cost center added · ' + form.code);
  };
  return (
    <div className="card">
      <div className="card-h">
        <div className="card-t">Cost centers · {ccs.length} total · {formatIDRShort(ccs.reduce((s,c)=>s+c.budget,0))} budget</div>
        <button className="btn btn-sm btn-primary" onClick={()=>{ setForm(blank); setOpen(true); }}><Icon n="plus" s={11}/>Add cost center</button>
      </div>
      <table className="tbl">
        <thead><tr><th>Code</th><th>Name</th><th>PIC</th><th style={{textAlign:'right'}}>Assets</th><th style={{textAlign:'right'}}>Budget</th><th>Usage</th><th style={{textAlign:'right'}}>Depr/bln</th></tr></thead>
        <tbody>
          {ccs.map((c,i)=>{
            const pct = c.budget ? (c.spent/c.budget)*100 : 0;
            return (
              <tr key={c.code} className="row-link">
                <td><span className="mono" style={{fontWeight:600}}>{c.code}</span></td>
                <td><div style={{fontWeight:600, fontSize:12.5}}>{c.name}</div></td>
                <td style={{fontSize:12, color:'var(--text-2)'}}>{c.pic}</td>
                <td className="mono" style={{textAlign:'right'}}>{c.assets}</td>
                <td className="mono" style={{textAlign:'right', fontWeight:600}}>{formatIDRShort(c.budget)}</td>
                <td style={{minWidth:140}}>
                  <Meter pct={pct} tone={pct>90?'danger':pct>75?'warn':'brand'}/>
                  <div className="mono" style={{fontSize:10, color:'var(--text-3)', marginTop:3}}>{pct.toFixed(0)}% · {formatIDRShort(c.spent)}</div>
                </td>
                <td className="mono" style={{textAlign:'right', color:'var(--danger)'}}>−{formatIDRShort(c.depr)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Modal open={open} onClose={()=>setOpen(false)} title="Add cost center" sub="GL allocation & annual budget"
        footer={<><button className="btn" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={save}><Icon n="check" s={12}/>Save</button></>}>
        <FieldRow>
          <Field label="Code" req value={form.code} onChange={v=>setForm(f=>({...f, code:v}))} placeholder="CC-XXX-001"/>
          <Field label="PIC" type="select" value={form.pic} onChange={v=>setForm(f=>({...f, pic:v}))}
            options={['Bambang W.','Lia R.','Andi P.','Eko P.','Dr. Ratna','Surya D.','Ratna I.']}/>
        </FieldRow>
        <Field label="Cost center name" req value={form.name} onChange={v=>setForm(f=>({...f, name:v}))} placeholder="e.g. Engineering"/>
        <FieldRow>
          <Field label="Annual budget (Rp)" type="number" value={form.budget} onChange={v=>setForm(f=>({...f, budget:v}))} placeholder="840000000"/>
          <Field label="GL account" value={form.gl} onChange={v=>setForm(f=>({...f, gl:v}))} placeholder="5xxx" hint="GL expense account"/>
        </FieldRow>
      </Modal>
    </div>
  );
}

function MasterDataSuppliers({toast, addRef}){
  const [sups, setSups] = useState([
    {n:'PT. Apple Indonesia',     tier:1, cat:'IT',       leadTime:'14 days', last:'2 days ago',  active:84,  rating:4.8},
    {n:'PT. Dell Indonesia',      tier:1, cat:'IT',       leadTime:'21 days', last:'1 week',     active:142, rating:4.6},
    {n:'PT. Astra Hilti',         tier:1, cat:'Tools',    leadTime:'7 days',  last:'3 days',       active:62,  rating:4.7},
    {n:'PT. Toyota Astra Motor',  tier:1, cat:'Vehicles', leadTime:'30 days', last:'2 months',      active:8,   rating:4.9},
    {n:'PT. Mettler Toledo',      tier:1, cat:'Lab',      leadTime:'45 days', last:'4 months',      active:14,  rating:4.5},
    {n:'PT. Philips Indonesia',   tier:1, cat:'Medical',  leadTime:'30 days', last:'6 months',      active:12,  rating:4.8},
    {n:'PT. Werner Sarana',       tier:2, cat:'Tools',    leadTime:'14 days', last:'1 month',      active:18,  rating:4.2},
    {n:'CV. Mebel Jaya',          tier:2, cat:'Furniture',leadTime:'21 days', last:'2 weeks',     active:48,  rating:4.4},
    {n:'PT. Yamazaki Mazak',      tier:1, cat:'Machinery',leadTime:'90 days', last:'1 year',      active:2,   rating:5.0},
  ]);
  const [tierF, setTierF] = useState('All tiers');
  const blank = {n:'', tier:'1', cat:'IT', leadTime:''};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  useEffect(()=>{ if(addRef) addRef.current = ()=>{ setForm(blank); setOpen(true); }; }, [addRef]);
  const save = () => {
    if(!form.n.trim()){ toast('Supplier name is required'); return; }
    setSups(s => [{n:form.n, tier:Number(form.tier), cat:form.cat, leadTime:form.leadTime||'—', last:'new', active:0, rating:0}, ...s]);
    setOpen(false);
    toast('Supplier added · ' + form.n);
  };
  const shown = sups.filter(s => tierF==='All tiers' || `Tier ${s.tier}`===tierF);
  return (
    <div className="card">
      <div className="card-h">
        <div className="card-t">Suppliers · {sups.length} registered vendors</div>
        <div style={{display:'flex', gap:6}}>
          <select className="select" style={{height:30, fontSize:11.5}} value={tierF} onChange={e=>setTierF(e.target.value)}>
            <option>All tiers</option><option>Tier 1</option><option>Tier 2</option>
          </select>
          <button className="btn btn-sm btn-primary" onClick={()=>{ setForm(blank); setOpen(true); }}><Icon n="plus" s={11}/>Add supplier</button>
        </div>
      </div>
      <table className="tbl">
        <thead><tr><th>Supplier</th><th>Tier</th><th>Category</th><th>Lead time</th><th>Active assets</th><th>Rating</th><th>Last PO</th></tr></thead>
        <tbody>
          {shown.map((s,i)=>(
            <tr key={i} className="row-link">
              <td>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div className="ico p" style={{width:30, height:30}}><Icon n="truck" s={13}/></div>
                  <div>
                    <div style={{fontWeight:600, fontSize:12.5}}>{s.n}</div>
                    <div style={{fontSize:10, color:'var(--text-3)'}}>NPWP 01.234.567.{i}-001.000</div>
                  </div>
                </div>
              </td>
              <td><span className={`b ${s.tier===1?'s':'i'}`}>Tier {s.tier}</span></td>
              <td><span className="b">{s.cat}</span></td>
              <td className="mono" style={{fontSize:11.5}}>{s.leadTime}</td>
              <td className="mono" style={{fontWeight:600}}>{s.active}</td>
              <td>
                <span className="mono" style={{fontWeight:600, color:'var(--warn)'}}>{s.rating>0?`★ ${s.rating}`:'—'}</span>
              </td>
              <td style={{fontSize:11.5, color:'var(--text-3)'}}>{s.last}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={open} onClose={()=>setOpen(false)} title="Add supplier" sub="Vendor supplying assets & spare parts"
        footer={<><button className="btn" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={save}><Icon n="check" s={12}/>Save</button></>}>
        <Field label="Supplier name" req value={form.n} onChange={v=>setForm(f=>({...f, n:v}))} placeholder="PT. / CV. …"/>
        <FieldRow cols={3}>
          <Field label="Tier" type="select" value={form.tier} onChange={v=>setForm(f=>({...f, tier:v}))} options={[{v:'1',l:'Tier 1'},{v:'2',l:'Tier 2'}]}/>
          <Field label="Category" type="select" value={form.cat} onChange={v=>setForm(f=>({...f, cat:v}))}
            options={['IT','Tools','Furniture','Vehicles','Lab','Medical','Machinery']}/>
          <Field label="Lead time" value={form.leadTime} onChange={v=>setForm(f=>({...f, leadTime:v}))} placeholder="14 days"/>
        </FieldRow>
      </Modal>
    </div>
  );
}

function MasterDataClasses({toast, addRef}){
  const [rows, setRows] = useState([
    {k:'IT Equipment',     life:'4 years', tax:'Kel-1 · 4y',  m:'Straight Line',   cap:5000000, gl:'1501 / 1601 / 5901', n:4820, tone:'i'},
    {k:'Furniture',         life:'8 years', tax:'Kel-2 · 8y',  m:'Straight Line',   cap:5000000, gl:'1502 / 1602 / 5902', n:2840, tone:'p'},
    {k:'Tools & Equipment', life:'5 years', tax:'Kel-2 · 8y',  m:'Straight Line',   cap:3000000, gl:'1503 / 1603 / 5903', n:2140, tone:'w'},
    {k:'Vehicles',          life:'7 years', tax:'Kel-2 · 8y',  m:'Declining Balance',cap:50000000, gl:'1504 / 1604 / 5904', n:842,  tone:'c'},
    {k:'Lab Instruments',   life:'8 years', tax:'Kel-2 · 8y',  m:'Straight Line',   cap:10000000, gl:'1505 / 1605 / 5905', n:620,  tone:'s'},
    {k:'Medical Devices',   life:'10 years',tax:'Kel-3 · 16y', m:'Straight Line',   cap:20000000, gl:'1506 / 1606 / 5906', n:248,  tone:'d'},
    {k:'Industrial Mach.', life:'15 years',tax:'Kel-3 · 16y', m:'Units of Production',cap:100000000, gl:'1507 / 1607 / 5907', n:186, tone:'pk'},
    {k:'Buildings',          life:'20 years',tax:'Kel-Bangunan',m:'Straight Line',   cap:0,        gl:'1601 / 1701 / 5910', n:12,   tone:''},
  ]);
  const blank = {k:'', life:'4', tax:'Kel-1 · 4y', m:'Straight Line', cap:'', gl:''};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  useEffect(()=>{ if(addRef) addRef.current = ()=>{ setForm(blank); setOpen(true); }; }, [addRef]);
  const save = () => {
    if(!form.k.trim()){ toast('Class name is required'); return; }
    setRows(r => [{k:form.k, life:form.life+' years', tax:form.tax, m:form.m, cap:Number(form.cap)||0, gl:form.gl||'—', n:0, tone:'i'}, ...r]);
    setOpen(false);
    toast('Asset class added · ' + form.k);
  };
  return (
    <div className="card">
      <div className="card-h">
        <div className="card-t">Asset Classes · PSAK 16 / tax depreciation groups</div>
        <button className="btn btn-sm btn-primary" onClick={()=>{ setForm(blank); setOpen(true); }}><Icon n="plus" s={11}/>Add class</button>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Class</th><th>Useful life</th><th>Tax group</th><th>Method</th><th>Min capitalize</th><th>GL accounts</th><th style={{textAlign:'right'}}>Assets</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c,i)=>(
            <tr key={i} className="row-link">
              <td>
                <div style={{display:'flex', alignItems:'center', gap:9}}>
                  <div className={`ico ${c.tone||''}`} style={{width:28, height:28, borderRadius:6}}><Icon n="tag" s={11}/></div>
                  <div style={{fontWeight:600, fontSize:12.5}}>{c.k}</div>
                </div>
              </td>
              <td style={{fontWeight:600}}>{c.life}</td>
              <td><span className="b">{c.tax}</span></td>
              <td style={{fontSize:11.5}}>{c.m}</td>
              <td className="mono" style={{fontSize:11}}>{c.cap>0 ? formatIDRShort(c.cap) : '—'}</td>
              <td className="mono" style={{fontSize:10.5, color:'var(--text-3)'}}>{c.gl}</td>
              <td className="mono" style={{textAlign:'right', fontWeight:600}}>{c.n.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={open} onClose={()=>setOpen(false)} title="Add asset class" sub="PSAK 16 · useful life & tax group"
        footer={<><button className="btn" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={save}><Icon n="check" s={12}/>Save</button></>}>
        <Field label="Class name" req value={form.k} onChange={v=>setForm(f=>({...f, k:v}))} placeholder="e.g. IT Equipment"/>
        <FieldRow cols={3}>
          <Field label="Useful life (years)" type="number" value={form.life} onChange={v=>setForm(f=>({...f, life:v}))} placeholder="4"/>
          <Field label="Tax group" type="select" value={form.tax} onChange={v=>setForm(f=>({...f, tax:v}))}
            options={['Kel-1 · 4y','Kel-2 · 8y','Kel-3 · 16y','Kel-4 · 20y','Kel-Bangunan']}/>
          <Field label="Method" type="select" value={form.m} onChange={v=>setForm(f=>({...f, m:v}))}
            options={['Straight Line','Declining Balance','Units of Production']}/>
        </FieldRow>
        <FieldRow>
          <Field label="Min. capitalization (Rp)" type="number" value={form.cap} onChange={v=>setForm(f=>({...f, cap:v}))} placeholder="5000000"/>
          <Field label="GL accounts" value={form.gl} onChange={v=>setForm(f=>({...f, gl:v}))} placeholder="Cost / Accum / Expense" hint="1501 / 1601 / 5901"/>
        </FieldRow>
      </Modal>
    </div>
  );
}

function MasterDataCategories({toast, addRef}){
  const [sel, setSel] = useState('IT/Laptops');
  const [tree, setTree] = useState([
    {l:0, p:'IT', n:'IT Equipment', cnt:'4,820', icon:'laptop', open:true},
    {l:1, p:'IT/Laptops', n:'Laptops', cnt:'2,840', icon:'laptop'},
    {l:2, p:'IT/Laptops/Apple', n:'Apple', cnt:'1,420', icon:'laptop'},
    {l:2, p:'IT/Laptops/Dell', n:'Dell', cnt:'820', icon:'laptop'},
    {l:2, p:'IT/Laptops/Lenovo', n:'Lenovo', cnt:'600', icon:'laptop'},
    {l:1, p:'IT/Desktops', n:'Desktops', cnt:'420', icon:'laptop'},
    {l:1, p:'IT/Monitors', n:'Monitors', cnt:'1,284', icon:'laptop'},
    {l:1, p:'IT/Servers', n:'Servers', cnt:'142', icon:'laptop'},
    {l:0, p:'Tools', n:'Tools', cnt:'2,140', icon:'wrench'},
    {l:0, p:'Furniture', n:'Furniture', cnt:'2,840', icon:'chair'},
    {l:0, p:'Vehicles', n:'Vehicles', cnt:'842', icon:'truck'},
    {l:0, p:'Lab', n:'Lab Instruments', cnt:'620', icon:'flask'},
    {l:0, p:'Medical', n:'Medical Devices', cnt:'248', icon:'cross'},
    {l:0, p:'Machinery', n:'Industrial Machinery', cnt:'186', icon:'cog'},
  ]);
  const parents = tree.filter(c=>c.l===0);
  const blank = {n:'', parent:'(top level)', icon:'box'};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  useEffect(()=>{ if(addRef) addRef.current = ()=>{ setForm(blank); setOpen(true); }; }, [addRef]);
  const save = () => {
    if(!form.n.trim()){ toast('Category name is required'); return; }
    const top = form.parent === '(top level)';
    const parent = tree.find(c=>c.n===form.parent);
    const newItem = {
      l: top ? 0 : (parent ? parent.l+1 : 1),
      p: (top ? '' : form.parent+'/') + form.n,
      n: form.n, cnt:'0', icon: top ? form.icon : (parent?parent.icon:'box'),
    };
    if (top) { setTree(t => [...t, newItem]); }
    else {
      const idx = tree.findIndex(c=>c.n===form.parent);
      setTree(t => { const copy=[...t]; copy.splice(idx+1, 0, newItem); return copy; });
    }
    setSel(newItem.p);
    setOpen(false);
    toast('Category added · ' + form.n);
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr', gap:14}}>
      <div className="card">
        <div className="card-h">
          <div className="card-t">Category hierarchy</div>
          <button className="btn btn-sm" onClick={()=>{ setForm(blank); setOpen(true); }}><Icon n="plus" s={11}/>Add</button>
        </div>
        <div style={{padding:'10px 14px'}}>
          {tree.map((c,i)=>(
            <div key={i}
              onClick={()=>setSel(c.p)}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'6px 8px', borderRadius:5,
                marginLeft: c.l*16,
                background: sel===c.p ? 'var(--brand-soft)' : 'transparent',
                cursor:'pointer',
                marginBottom:1,
              }}>
              <Icon n="chev" s={9} c="" style={{opacity:c.l<2?1:0, transform: c.open?'rotate(90deg)':'none'}}/>
              <Icon n={c.icon} s={12} c=""/>
              <span style={{flex:1, fontSize:12, fontWeight: sel===c.p?650:550, color: sel===c.p?'var(--brand-strong)':'var(--text)'}}>{c.n}</span>
              <span className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{c.cnt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><div className="card-t">Sub-categories · Laptops</div></div>
        <div style={{padding:0}}>
          {[
            {n:'MacBook Pro 16" M3 Max', m:'Apple', cnt:84,  life:'4y SL'},
            {n:'MacBook Pro 14" M3',     m:'Apple', cnt:142, life:'4y SL'},
            {n:'MacBook Air 15" M3',     m:'Apple', cnt:280, life:'4y SL'},
            {n:'Dell Latitude 7440',     m:'Dell',  cnt:184, life:'4y SL'},
            {n:'Dell XPS 15',            m:'Dell',  cnt:62,  life:'4y SL'},
            {n:'Lenovo ThinkPad X1',     m:'Lenovo',cnt:148, life:'4y SL'},
          ].map((m,i)=>(
            <div key={i} style={{padding:'10px 14px', borderBottom: i<5?'1px solid var(--border-soft)':0, display:'flex', alignItems:'center', gap:10}}>
              <div className="ico i" style={{width:26, height:26, borderRadius:5}}><Icon n="laptop" s={11}/></div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:12}}>{m.n}</div>
                <div style={{fontSize:10, color:'var(--text-3)'}}>{m.m} · {m.life}</div>
              </div>
              <span className="b">{m.cnt} unit</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><div className="card-t">Detail · MacBook Pro 16"</div></div>
        <div className="card-b">
          <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>PSAK 16 attributes</div>
          <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'5px 12px', fontSize:11.5}}>
            <span style={{color:'var(--text-3)'}}>Classification</span><b>IT Equipment</b>
            <span style={{color:'var(--text-3)'}}>Useful life</span><b>4 yrs · PSAK 16</b>
            <span style={{color:'var(--text-3)'}}>Method</span><b>Straight Line</b>
            <span style={{color:'var(--text-3)'}}>Residual value</span><b className="mono">Rp 0</b>
            <span style={{color:'var(--text-3)'}}>Tax life (PPh)</span><b>4 yrs · Group 1</b>
            <span style={{color:'var(--text-3)'}}>Min capitalisation</span><b className="mono">Rp 5.000.000</b>
            <span style={{color:'var(--text-3)'}}>GL Cost</span><b className="mono">1501-IT</b>
            <span style={{color:'var(--text-3)'}}>GL Accum. depr.</span><b className="mono">1601-IT</b>
            <span style={{color:'var(--text-3)'}}>GL Depr expense</span><b className="mono">5901-IT</b>
          </div>

          <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:14, marginBottom:8}}>Sync status · ERP</div>
          <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
            <span className="b s dot">Accurate · synced</span>
            <span className="b s dot">Odoo · synced</span>
            <span className="b w dot">SAP B1 · pending</span>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title="Add category" sub="Create a category or sub-category"
        footer={<><button className="btn" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={save}><Icon n="check" s={12}/>Save</button></>}>
        <Field label="Category name" req value={form.n} onChange={v=>setForm(f=>({...f, n:v}))} placeholder="e.g. Drones / Networking"/>
        <Field label="Parent" type="select" value={form.parent} onChange={v=>setForm(f=>({...f, parent:v}))}
          options={['(top level)', ...tree.map(c=>c.n)]} hint="Choose (top level) for a main category"/>
        {form.parent === '(top level)' && (
          <Field label="Icon" type="select" value={form.icon} onChange={v=>setForm(f=>({...f, icon:v}))}
            options={[{v:'box',l:'Box (general)'},{v:'laptop',l:'IT'},{v:'wrench',l:'Tools'},{v:'chair',l:'Furniture'},{v:'truck',l:'Vehicles'},{v:'flask',l:'Lab'},{v:'cross',l:'Medical'},{v:'cog',l:'Machinery'}]}/>
        )}
      </Modal>
    </div>
  );
}
function RTLSPage({navigate, toast}){
  const [locOpen, setLocOpen] = useState(false);
  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Real-Time Asset Location</h1>
          <p className="page-desc">Live position of every asset · UHF phase + BLE anchor fusion · sub-meter accuracy · refreshes every 250ms.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast('Switch site · pick a site & floor')}><Icon n="building" s={13}/>JKT-HQ · Floor 8</button>
          <button className="btn btn-primary" onClick={()=>setLocOpen(true)}><Icon n="radar" s={13}/>Locate asset</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
        <Stat label="Tracked assets" value="2,420" sub="live position" tone="brand"/>
        <Stat label="Accuracy" value="±0,4 m" sub="UHF phase + BLE" tone="success"/>
        <Stat label="Zones" value="28" sub="12 sites · 84 anchors"/>
        <Stat label="Missing &gt; 24h" value="4" sub="last seen but no ping" tone="warn"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14}}>
        <div className="card">
          <div className="card-h">
            <div className="card-t">JKT-HQ · Floor 8 · live</div>
            <span className="b s dot">Live · 142 assets</span>
          </div>
          <div style={{padding:14}}>
            <svg viewBox="0 0 600 360" style={{width:'100%', height:'100%', background:'var(--surface-2)', borderRadius:8}}>
              <defs>
                <pattern id="gp" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="600" height="360" fill="url(#gp)"/>

              <rect x="20" y="20" width="200" height="80" rx="4" fill="rgba(255,255,255,.03)" stroke="var(--border-strong)" strokeWidth="1"/>
              <text x="120" y="60" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)">Open Workstations</text>

              <rect x="240" y="20" width="120" height="80" rx="4" fill="rgba(255,255,255,.03)" stroke="var(--border-strong)" strokeWidth="1"/>
              <text x="300" y="60" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)">Meeting 8A</text>

              <rect x="380" y="20" width="120" height="80" rx="4" fill="rgba(255,255,255,.03)" stroke="var(--border-strong)" strokeWidth="1"/>
              <text x="440" y="60" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)">Meeting 8B</text>

              <rect x="520" y="20" width="60" height="80" rx="4" fill="rgba(59,130,246,.18)" stroke="var(--brand)" strokeWidth="1.2"/>
              <text x="550" y="56" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--brand-strong)">IT</text>

              <rect x="20" y="120" width="320" height="160" rx="4" fill="rgba(255,255,255,.03)" stroke="var(--border-strong)" strokeWidth="1"/>
              <text x="180" y="210" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-2)">Engineering · 48 desks</text>

              <rect x="360" y="120" width="220" height="160" rx="4" fill="rgba(255,255,255,.03)" stroke="var(--border-strong)" strokeWidth="1"/>
              <text x="470" y="210" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-2)">Design · 36 desks</text>

              <rect x="420" y="300" width="160" height="40" rx="4" fill="rgba(45,212,191,.15)" stroke="var(--success)" strokeWidth="1.2"/>
              <text x="500" y="324" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--success)">Gate · Lift</text>

              {[{x:50,y:50},{x:300,y:50},{x:440,y:50},{x:120,y:200},{x:300,y:200},{x:460,y:200}].map((a,i)=>(
                <g key={i}><circle cx={a.x} cy={a.y} r="2.5" fill="var(--cyan)"/><circle cx={a.x} cy={a.y} r="6" fill="none" stroke="var(--cyan)" strokeWidth="1" opacity=".5"/></g>
              ))}

              {[
                {x:60, y:60, c:'var(--brand)'}, {x:100, y:65, c:'var(--brand)'},
                {x:160, y:60, c:'var(--purple)'}, {x:280, y:55, c:'var(--brand)'},
                {x:320, y:60, c:'var(--warn)'}, {x:550, y:55, c:'var(--cyan)'}, {x:540, y:80, c:'var(--cyan)'},
                {x:80, y:180, c:'var(--brand)'}, {x:160, y:200, c:'var(--brand)'}, {x:230, y:230, c:'var(--brand)'},
                {x:130, y:230, c:'var(--purple)'}, {x:200, y:160, c:'var(--purple)'}, {x:80, y:240, c:'var(--purple)'},
                {x:430, y:160, c:'var(--brand)'}, {x:480, y:200, c:'var(--brand)'}, {x:520, y:250, c:'var(--brand)'},
                {x:440, y:220, c:'var(--purple)'}, {x:480, y:160, c:'var(--purple)'}, {x:560, y:160, c:'var(--warn)'},
                {x:380, y:200, c:'var(--warn)'},
              ].map((d,i)=>(
                <circle key={i} cx={d.x} cy={d.y} r="4" fill={d.c} stroke="var(--bg)" strokeWidth="1.5">
                  <animate attributeName="opacity" values="1;.6;1" dur={`${2+i*.2}s`} repeatCount="indefinite"/>
                </circle>
              ))}

              <circle cx="160" cy="200" r="14" fill="none" stroke="var(--danger)" strokeWidth="2.5">
                <animate attributeName="r" values="10;20;10" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="1;.3;1" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <line x1="160" y1="200" x2="160" y2="166" stroke="var(--danger)" strokeWidth="2"/>
              <rect x="115" y="156" width="90" height="14" rx="3" fill="var(--danger)"/>
              <text x="160" y="166" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">IT-LP-9847</text>
            </svg>
            <div style={{display:'flex', gap:14, marginTop:8, fontSize:10, color:'var(--text-3)', flexWrap:'wrap'}}>
              <span><span style={{display:'inline-block',width:9,height:9,background:'var(--brand)',borderRadius:50,marginRight:5}}/>Laptops (62)</span>
              <span><span style={{display:'inline-block',width:9,height:9,background:'var(--purple)',borderRadius:50,marginRight:5}}/>Furniture (38)</span>
              <span><span style={{display:'inline-block',width:9,height:9,background:'var(--warn)',borderRadius:50,marginRight:5}}/>Monitors (28)</span>
              <span><span style={{display:'inline-block',width:9,height:9,background:'var(--cyan)',borderRadius:50,marginRight:5}}/>BLE anchor</span>
            </div>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div className="card">
            <div className="card-h"><div className="card-t">Selected · IT-LP-9847</div><span className="b s dot">Live</span></div>
            <div className="card-b">
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                <div className="ico i" style={{width:36, height:36}}><Icon n="laptop" s={16}/></div>
                <div>
                  <div style={{fontWeight:650, fontSize:13}}>MacBook Pro 16"</div>
                  <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>IT-LP-9847 · Dewi A.</div>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'4px 10px', fontSize:11.5}}>
                <span style={{color:'var(--text-3)'}}>Position</span><b className="mono">X 160 · Y 200</b>
                <span style={{color:'var(--text-3)'}}>Zone</span><b>Eng · Desk 8-142</b>
                <span style={{color:'var(--text-3)'}}>Last ping</span><b>2s ago · −48 dBm</b>
                <span style={{color:'var(--text-3)'}}>Accuracy</span><b className="mono">±0,3 m</b>
              </div>
              <button className="btn btn-sm btn-primary" style={{width:'100%', marginTop:10}} onClick={()=>navigate('detail', {assetId:'IT-LP-9847'})}>Open profile</button>
            </div>
          </div>

          <div className="card" style={{flex:1}}>
            <div className="card-h"><div className="card-t">Saved location queries</div></div>
            <div style={{padding:8, display:'flex', flexDirection:'column', gap:4}}>
              {[
                {q:'All idle laptops · F8', n:6, tone:'i'},
                {q:'Forklifts not at dock', n:3, tone:'w'},
                {q:'Assets &gt; Rp 100 jt', n:42},
                {q:'Loaner pool · available', n:14, tone:'s'},
                {q:'Last seen Lobby &gt; 1h', n:2, tone:'d'},
              ].map((q,i)=>(
                <button key={i} onClick={()=>toast('Query: ' + q.q)} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 11px', borderRadius:6, border:'1px solid var(--border)', background:'var(--surface-2)', fontSize:11.5}}>
                  <span style={{textAlign:'left'}} dangerouslySetInnerHTML={{__html: q.q}}/>
                  <span className={`b ${q.tone||''}`}>{q.n}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <LocateAssetModal open={locOpen} onClose={()=>setLocOpen(false)} toast={toast} navigate={navigate}/>
    </div>
  );
}

/* --- LOSS PREVENTION --- */
function SecurityPage({navigate, toast}){
  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Loss Prevention · Security</h1>
          <p className="page-desc">RFID gates at every exit. Geofence breaches, off-hours scans, ML anomaly detection. CCTV auto-tagged on alert.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>navigate('settings')}><Icon n="shield" s={13}/>Geofence rules</button>
          <button className="btn btn-danger" onClick={()=>window.scrollTo({top:300, behavior:'smooth'})}><Icon n="alert" s={13}/>3 active alerts</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
        <Stat label="Active geofences" value="14" sub="12 sites · 4 high-value"/>
        <Stat label="Alerts today" value="3" sub="1 confirmed · 2 review" tone="danger"/>
        <Stat label="Missing > 7d" value="4" sub={formatIDRShort(3840000) + ' NBV'} tone="warn"/>
        <Stat label="Recovery rate" value="94%" sub="last 12 months" tone="success"/>
      </div>

      <div className="card">
        <div className="card-h"><div className="card-t">Live alerts</div><span className="b d dot">3 critical</span></div>
        <div style={{padding:0}}>
          {[
            {sev:'critical', t:'14:22', a:'IT-LP-9847', n:'MacBook Pro 16"', ev:'Attempted lobby exit without a valid checkout', cust:'Dewi A.', val:50400000},
            {sev:'high',     t:'13:18', a:'TL-DR-0244', n:'Hilti Drill', ev:'Scanned at Gate-2 outside work hours (after 18:00)', cust:'Badge not recognized', val:9800000},
            {sev:'med',     t:'12:42', a:'VH-FK-0041', n:'Forklift 4x4', ev:'Left geofence (Bay 2 → Loading Dock) without dispatch', cust:'Andi P.', val:445000000},
          ].map((al,i)=>(
            <div key={i} style={{padding:'14px 18px', borderBottom: i<2?'1px solid var(--border-soft)':0, background: al.sev==='critical' ? 'rgba(248,113,113,.04)' : 'transparent'}}>
              <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
                <div className={`ico ${al.sev==='critical'?'d':al.sev==='high'?'w':'i'}`} style={{width:38, height:38, borderRadius:8}}><Icon n="alert" s={18}/></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                    <span className={`b ${al.sev==='critical'?'d':al.sev==='high'?'w':'i'} dot`}>{al.sev.toUpperCase()}</span>
                    <span className="mono" style={{fontSize:10.5, color:'var(--text-3)'}}>{al.t}</span>
                    <span className="mono" style={{marginLeft:'auto', fontSize:11.5, fontWeight:600, color:'var(--cyan)'}}>{formatIDRShort(al.val)}</span>
                  </div>
                  <div style={{fontWeight:600, fontSize:13}}>{al.n} · <span className="mono" style={{fontSize:11, color:'var(--text-2)'}}>{al.a}</span></div>
                  <div style={{fontSize:11.5, color:'var(--text-2)', marginTop:4}}>{al.ev}</div>
                  <div style={{fontSize:10.5, color:'var(--text-3)', marginTop:3, display:'flex', alignItems:'center', gap:5}}>
                    <Icon n="user" s={10}/> {al.cust}
                  </div>
                </div>
              </div>
              <div style={{display:'flex', gap:6, marginTop:10, marginLeft:50}}>
                {al.sev==='critical' && <button className="btn btn-sm btn-danger" onClick={()=>toast('Security paged · gate locked')}><Icon n="lock" s={11}/>Halt + page security</button>}
                <button className="btn btn-sm" onClick={()=>toast('CCTV footage opened')}><Icon n="eye" s={11}/>Review CCTV</button>
                <button className="btn btn-sm" onClick={()=>navigate('detail', {assetId: al.a})}>View asset</button>
                {al.sev !== 'critical' && <button className="btn btn-sm btn-ghost" onClick={()=>toast('Alert resolved')}>Mark resolved</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- REPORTS --- */
function ReportsPage({navigate, toast}){
  const reports = [
    {n:'Depreciation Schedule',         id:'PSAK 16 schedule',         icon:'dollar', tone:'i',  desc:'Per-asset depreciation schedule · PSAK 16 · by class / cost center', fmt:['PDF','Excel'], last:'2 days ago'},
    {n:'Asset Roll-Forward',             id:'Capital Roll-Forward',     icon:'refresh',tone:'c',  desc:'Beginning balance + additions − disposals − depreciation = ending balance', fmt:['PDF','Excel'], last:'1 week'},
    {n:'Form 1771 Lampiran 1A',         id:'SPT Tahunan PPh Badan',     icon:'shield', tone:'s',  desc:'Tax-aligned depreciation per PPh kelompok pajak (Kel 1-3 + Bangunan)', fmt:['PDF','XML'], last:'Last year-end'},
    {n:'Year-End Audit Pack',           id:'BPKP / KAP bundle',       icon:'audit',  tone:'p',  desc:'BPKP / KAP-ready bundle: register, BAST, stock count, journal entries, sign-offs', fmt:['ZIP','PDF'], last:'Q4 2024'},
    {n:'Stock Count Reconciliation',  id:'Variance results',        icon:'check',  tone:'s',  desc:'Per-zone variance, NBV impact, signed by auditor + external accountant', fmt:['PDF','Excel'], last:'14 days'},
    {n:'Asset by Custodian',            id:'Handover lists', icon:'user',   tone:'',  desc:'List of assets assigned per employee · for handover (BAST)', fmt:['PDF','Excel','CSV'], last:'on demand'},
    {n:'Cost Center Allocation',        id:'Cost center view',       icon:'building',tone:'i', desc:'Asset value + monthly depreciation per cost center', fmt:['PDF','Excel'], last:'monthly'},
    {n:'Maintenance Cost Report',       id:'Cost analysis', icon:'wrench', tone:'w',  desc:'Parts + labor + downtime cost per asset · trend analysis', fmt:['PDF','Excel'], last:'monthly'},
    {n:'EPCIS 2.0 Event Export',        id:'EPCIS JSON-LD',          icon:'radar',  tone:'c',  desc:'JSON-LD export of all RFID custody events · GS1 EPCIS 2.0 compliant', fmt:['JSON','XML'], last:'continuous'},
    {n:'Loss & Recovery Report',        id:'Loss & claims',        icon:'alert',  tone:'d',  desc:'Missing assets, theft incidents, recovery rate, insurance claims', fmt:['PDF','Excel'], last:'1 month'},
    {n:'Warranty Expiration Watch',     id:'Expiry watchlist',              icon:'cal',    tone:'w',  desc:'Assets with warranty expiring in next 30/60/90 days', fmt:['PDF','Excel'], last:'live'},
    {n:'Calibration Certificate Log',  id:'ISO 17025 certs',  icon:'flask',  tone:'s',  desc:'ISO 17025 traceable certs for regulated lab + medical assets', fmt:['ZIP','PDF'], last:'continuous'},
  ];
  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-desc">Standard reports for Finance, Audit, Operations &amp; Tax (DJP). PSAK 16 + Form 1771 Attachment 1A + BPKP audit pack, auto-generated.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast('History · last 30 generated reports')}><Icon n="cal" s={13}/>History</button>
          <button className="btn btn-primary" onClick={()=>toast('Generating all monthly scheduled reports · processing')}><Icon n="refresh" s={13}/>Generate all</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
        <Stat label="Available reports" value="12" sub="+8 auto-scheduled"  tone="brand"  icon="doc"/>
        <Stat label="Generated today"  value="3"  sub="depreciation · audit · cc" tone="success" icon="check"/>
        <Stat label="Scheduled monthly" value="8"  sub="auto-emailed to the CFO" tone="cyan"    icon="cal"/>
        <Stat label="Compliance status" value="OK" sub="PSAK 16 · PPh · BPKP" tone="success" icon="shield"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
        {reports.map((r,i)=>(
          <div key={i} className="card" style={{padding:16, display:'flex', flexDirection:'column', gap:10}}>
            <div style={{display:'flex', alignItems:'flex-start', gap:11}}>
              <div className={`ico ${r.tone||''}`} style={{width:36, height:36, borderRadius:9}}><Icon n={r.icon} s={16}/></div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:650, fontSize:13.5}}>{r.n}</div>
                <div style={{fontSize:10.5, color:'var(--text-3)', marginTop:1}}>{r.id}</div>
              </div>
            </div>
            <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.5, minHeight:48}}>{r.desc}</div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto'}}>
              <div style={{display:'flex', gap:4}}>
                {r.fmt.map(f => <span key={f} className="b" style={{fontSize:9.5}}>{f}</span>)}
              </div>
              <span style={{fontSize:10, color:'var(--text-3)'}}>last: {r.last}</span>
            </div>
            <div style={{display:'flex', gap:6, marginTop:4}}>
              <button className="btn btn-sm" style={{flex:1}} onClick={()=>toast(`Preview: ${r.n}`)}><Icon n="eye" s={11}/>Preview</button>
              <button className="btn btn-sm btn-primary" style={{flex:1}} onClick={()=>toast(`Generate ${r.n} · ${r.fmt[0]} · ready in 2-5s`)}><Icon n="dl" s={11}/>Generate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- USER MANAGEMENT --- */
function UsersPage({navigate, toast}){
  const [tab, setTab] = useState('users');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [uq, setUq] = useState('');
  const [uRole, setURole] = useState('all');

  const users = [
    {n:'Bambang Wijaya',     role:'Admin',           dept:'Finance & Admin', email:'bambang.w@indojaya.id',  last:'now',         status:'active',  mfa:true,  pic:0},
    {n:'Dewi Anggraini',     role:'Asset Manager',  dept:'IT',              email:'dewi.a@indojaya.id',     last:'2m ago',       status:'active',  mfa:true,  pic:1},
    {n:'Rahmat Santoso',     role:'Auditor',         dept:'Operations',      email:'rahmat.s@indojaya.id',   last:'14m ago',     status:'active',  mfa:true,  pic:2},
    {n:'Andi Pratama',       role:'Maintenance',    dept:'Operations',      email:'andi.p@indojaya.id',     last:'1h ago',       status:'active',  mfa:false, pic:3},
    {n:'Ratna Indira',       role:'Finance',         dept:'Finance & Admin', email:'ratna.i@indojaya.id',    last:'2h ago',       status:'active',  mfa:true,  pic:4},
    {n:'Surya Dharma',       role:'CFO',             dept:'Executive',       email:'surya.d@indojaya.id',    last:'yesterday',     status:'active',  mfa:true,  pic:5},
    {n:'Eko Pranata',         role:'Technician',      dept:'Manufacturing',   email:'eko.p@indojaya.id',      last:'3h ago',       status:'active',  mfa:false, pic:6},
    {n:'Citra Wijaya',       role:'IT Support',     dept:'IT',              email:'citra.w@indojaya.id',    last:'1 week',    status:'invited', mfa:false, pic:1},
    {n:'Galang Tirta',       role:'Technician',      dept:'Maintenance',     email:'galang.t@indojaya.id',   last:'never',        status:'disabled',mfa:false, pic:2},
  ];

  const roles = [
    {r:'Admin',          users:2,  perms:'Full access · all modules + settings · destructive operations', tone:'d', icon:'shield'},
    {r:'Asset Manager',  users:4,  perms:'Create/edit/transfer assets · approve scan-in · view all',     tone:'i', icon:'box'},
    {r:'Custodian',      users:42, perms:'View assigned assets · check-out/return · request service',    tone:'s', icon:'user'},
    {r:'Auditor',         users:6,  perms:'Read-only · run audits · post adjustment journals',           tone:'c', icon:'audit'},
    {r:'Maintenance',    users:12, perms:'View asset health · close WOs · order parts',                    tone:'w', icon:'wrench'},
    {r:'Finance',         users:8,  perms:'View NBV/depr · approve disposals · post GL entries',         tone:'p', icon:'dollar'},
    {r:'IT Support',     users:4,  perms:'Manage IT assets · system config (read-only finance)',         tone:'pk',icon:'laptop'},
    {r:'Read-Only',       users:14, perms:'Browse register only',                                            tone:'',  icon:'eye'},
  ];

  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-desc">Manage users, roles, and access permissions · 142 active users · MFA enforced for Admin &amp; Finance · full audit log.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>setTab('log')}><Icon n="dl" s={13}/>Audit log</button>
          <button className="btn btn-primary" onClick={()=>setInviteOpen(true)}><Icon n="plus" s={13}/>Invite user</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
        <Stat label="Total users" value="142" sub="92 active · 8 invited · 4 disabled" tone="brand" icon="users"/>
        <Stat label="MFA enabled" value="88%" sub="125/142 · 17 need setup" tone="success" icon="shield"/>
        <Stat label="Pending invite" value="8" sub="oldest 3 days ago" tone="warn" icon="send"/>
        <Stat label="Failed logins · 24h" value="3" sub="2 from the same IP" tone="danger" icon="lock"/>
      </div>

      <div className="tabs">
        {[
          {id:'users', l:'Users · 142'},
          {id:'roles', l:'Roles & Permissions · 8'},
          {id:'log',   l:'Audit Log'},
        ].map(t=>(
          <button key={t.id} className={`tab ${tab===t.id?'on':''}`} onClick={()=>setTab(t.id)}>{t.l}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card">
          <div className="card-h">
            <div style={{display:'flex', alignItems:'center', gap:10, flex:1}}>
              <div className="card-t">Users</div>
              <div className="tb-search" style={{maxWidth:280, height:30, padding:'4px 10px'}}>
                <Icon n="search" s={12}/>
                <input placeholder="Search name, email…" value={uq} onChange={e=>setUq(e.target.value)} style={{fontSize:11.5}}/>
              </div>
            </div>
            <select className="select" value={uRole} onChange={e=>setURole(e.target.value)} style={{height:30, fontSize:11.5, minWidth:140}}>
              <option value="all">All roles</option>
              {roles.map(r=><option key={r.r} value={r.r}>{r.r}</option>)}
            </select>
          </div>
          <table className="tbl">
            <thead><tr><th>User</th><th>Role</th><th>Department</th><th>MFA</th><th>Last login</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.filter(u => (uRole==='all' || u.role===uRole) && (!uq || (u.n+u.email+u.dept).toLowerCase().includes(uq.toLowerCase()))).map((u,i)=>(
                <tr key={i} className="row-link">
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <Avatar name={u.n} i={u.pic}/>
                      <div>
                        <div style={{fontWeight:600, fontSize:12.5}}>{u.n}</div>
                        <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="b i">{u.role}</span></td>
                  <td style={{fontSize:12, color:'var(--text-2)'}}>{u.dept}</td>
                  <td>{u.mfa ? <span className="b s dot">ON</span> : <span className="b w">Setup</span>}</td>
                  <td style={{fontSize:11.5, color:'var(--text-3)'}}>{u.last}</td>
                  <td><span className={`b ${u.status==='active'?'s':u.status==='invited'?'w':''} dot`}>{u.status==='active'?'Active':u.status==='invited'?'Invited':'Disabled'}</span></td>
                  <td>
                    <button className="btn btn-i btn-sm" onClick={(e)=>{e.stopPropagation(); toast('Menu for ' + u.n)}}><Icon n="cog" s={11}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'roles' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {roles.map((r,i)=>(
            <div key={r.r} className="card" style={{padding:14}}>
              <div style={{display:'flex', alignItems:'center', gap:11, marginBottom:10}}>
                <div className={`ico ${r.tone||''}`}><Icon n={r.icon} s={15}/></div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:650, fontSize:14}}>{r.r}</div>
                  <div style={{fontSize:10.5, color:'var(--text-3)'}}>{r.users} user{r.users>1?'s':''} assigned</div>
                </div>
                <button className="btn btn-sm" onClick={()=>toast('Edit role permissions · ' + r.r)}>Edit</button>
              </div>
              <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.55}}>{r.perms}</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:4, marginTop:10}}>
                {['Register','Scan-In','Scan-Out','Transfer','Audit','Maintenance','Finance','Master Data','Settings'].map(p => {
                  const has = r.r==='Admin' || (r.r==='Asset Manager' && !['Settings','Finance'].includes(p)) ||
                              (r.r==='Auditor' && ['Register','Audit'].includes(p)) ||
                              (r.r==='Finance' && ['Register','Finance'].includes(p)) ||
                              (r.r==='Maintenance' && ['Register','Maintenance'].includes(p)) ||
                              (r.r==='Custodian' && p==='Register') ||
                              (r.r==='IT Support' && ['Register','Master Data'].includes(p));
                  return <span key={p} className={`b ${has?'s':''}`} style={{fontSize:9, opacity: has?1:.5}}>{p}</span>;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'log' && (
        <div className="card">
          <div className="card-h"><div className="card-t">Audit log · last 24h · 142 events</div></div>
          <table className="tbl">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th><th>IP</th></tr></thead>
            <tbody>
              {[
                {t:'14:22:08', u:'Bambang W.', a:'asset.disposal.approved', r:'VH-04 Toyota Hilux 2018', ip:'10.4.1.22'},
                {t:'14:14:42', u:'Dewi A.',    a:'asset.transferred',         r:'IT-LP-9847 → BDG-Office', ip:'10.4.8.14'},
                {t:'13:48:18', u:'Rahmat S.',  a:'audit.zone.completed',      r:'JKT-HQ · Floor 8 (Eng)', ip:'10.4.8.42'},
                {t:'13:22:04', u:'Andi P.',     a:'wo.opened',                 r:'WO-2410-088 · CNC MC-0011', ip:'10.4.1.18'},
                {t:'12:58:32', u:'Eko P.',      a:'tool.checked-out',          r:'TL-DR-0142 Hilti Drill',  ip:'10.4.1.92'},
                {t:'12:14:18', u:'Ratna I.',   a:'gl.entry.posted',           r:'ADJ-2025-Q4', ip:'10.4.1.22'},
                {t:'10:42:08', u:'unknown',     a:'login.failed',              r:'attempt as bambang.w', ip:'182.4.12.88'},
                {t:'09:18:42', u:'Bambang W.', a:'user.role.changed',         r:'Citra W. · IT Support → Asset Manager', ip:'10.4.1.22'},
              ].map((e,i)=>(
                <tr key={i}>
                  <td className="mono" style={{fontSize:11, color:'var(--text-3)'}}>{e.t}</td>
                  <td style={{fontSize:12}}>{e.u}</td>
                  <td><span className="mono" style={{fontSize:11, color: e.a.includes('failed')?'var(--danger)':e.a.includes('approved')||e.a.includes('completed')?'var(--success)':'var(--brand-strong)'}}>{e.a}</span></td>
                  <td style={{fontSize:11.5, color:'var(--text-2)'}}>{e.r}</td>
                  <td className="mono" style={{fontSize:10.5, color: e.ip.startsWith('10.')?'var(--text-3)':'var(--danger)'}}>{e.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inviteOpen && (
        <>
          <div className="sheet-overlay" onClick={()=>setInviteOpen(false)}/>
          <div className="sheet">
            <div style={{padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:16, fontWeight:650, letterSpacing:'-0.01em'}}>Invite new user</div>
                <div style={{fontSize:11, color:'var(--text-3)', marginTop:2}}>An email invite will be sent with a 7-day activation link</div>
              </div>
              <button className="btn btn-i" onClick={()=>setInviteOpen(false)}><Icon n="x" s={14}/></button>
            </div>
            <div style={{padding:20, flex:1, overflow:'auto', display:'flex', flexDirection:'column', gap:14}}>
              <label style={{fontSize:11, fontWeight:600, color:'var(--text-2)'}}>
                Email
                <input className="input" style={{display:'block', marginTop:5, width:'100%'}} placeholder="nama@indojaya.id" defaultValue=""/>
              </label>
              <label style={{fontSize:11, fontWeight:600, color:'var(--text-2)'}}>
                Full name
                <input className="input" style={{display:'block', marginTop:5, width:'100%'}} placeholder="Employee full name"/>
              </label>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <label style={{fontSize:11, fontWeight:600, color:'var(--text-2)'}}>
                  Role
                  <select className="select" style={{display:'block', marginTop:5, width:'100%'}}>
                    {roles.map(r=><option key={r.r}>{r.r}</option>)}
                  </select>
                </label>
                <label style={{fontSize:11, fontWeight:600, color:'var(--text-2)'}}>
                  Departemen
                  <select className="select" style={{display:'block', marginTop:5, width:'100%'}}>
                    <option>Engineering</option><option>Operations</option><option>Finance</option><option>IT</option>
                  </select>
                </label>
              </div>
              <label style={{fontSize:11, fontWeight:600, color:'var(--text-2)'}}>
                Default location
                <select className="select" style={{display:'block', marginTop:5, width:'100%'}}>
                  <option>JKT-HQ · Floor 8</option><option>JKT-HQ · Floor 12</option><option>BDG-Office</option><option>MDN-Office</option>
                </select>
              </label>
              <div className="card" style={{padding:12, background:'var(--surface-2)', marginTop:6}}>
                <div style={{fontSize:11, fontWeight:600, color:'var(--text-2)', marginBottom:8}}>Quick permissions</div>
                {[
                  {l:'Require MFA',           on:true},
                  {l:'Auto-assign EPC tags',       on:true},
                  {l:'Send welcome email',         on:true},
                  {l:'Notify supervisor on activation', on:false},
                ].map((p,i)=>(
                  <label key={i} style={{display:'flex', alignItems:'center', gap:8, padding:'5px 0', fontSize:11.5}}>
                    <input type="checkbox" defaultChecked={p.on}/>{p.l}
                  </label>
                ))}
              </div>
            </div>
            <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', gap:8}}>
              <button className="btn" style={{flex:1}} onClick={()=>setInviteOpen(false)}>Cancel</button>
              <button className="btn btn-primary" style={{flex:2}} onClick={()=>{setInviteOpen(false); toast('Invite sent · link valid for 7 days')}}><Icon n="send" s={12}/>Send invite</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* --- SETTINGS --- */
function SettingsPage({navigate, toast}){
  const [tab, setTab] = useState('general');
  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-desc">System configuration · workspace, notifications, maintenance reminder schedules, ERP integrations, and security.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>{ ['kfa_disposals','kfa_transfers','kfa_loans','kfa_reservations'].forEach(k=>localStorage.removeItem(k)); toast('Demo data cleared · refresh to see defaults'); }}><Icon n="refresh" s={13}/>Reset demo data</button>
          <button className="btn btn-primary" onClick={()=>toast('Settings saved')}><Icon n="check" s={13}/>Save changes</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'220px 1fr', gap:14}}>
        <div className="card">
          <div className="card-h"><div className="card-t">Configuration</div></div>
          <div style={{padding:6}}>
            {[
              {id:'general',     icon:'building', l:'General'},
              {id:'notif',       icon:'bell',     l:'Notifications'},
              {id:'reminder',    icon:'cal',      l:'Maintenance Reminders'},
              {id:'integrations',icon:'db',       l:'Integrations'},
              {id:'rfid',        icon:'radar',    l:'RFID Hardware'},
              {id:'security',    icon:'shield',   l:'Security'},
              {id:'billing',     icon:'dollar',   l:'Billing'},
            ].map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                display:'flex', alignItems:'center', gap:10, width:'100%',
                padding:'9px 11px', borderRadius:6, fontSize:12.5, fontWeight: tab===t.id?650:550,
                color: tab===t.id ? 'var(--brand-strong)' : 'var(--text-2)',
                background: tab===t.id ? 'var(--brand-soft)' : 'transparent',
                marginBottom:2,
                boxShadow: tab===t.id ? 'inset 2px 0 0 var(--brand)' : 'none',
                transition:'background .14s',
              }}>
                <Icon n={t.icon} s={13}/>{t.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          {tab === 'general'      && <SettingsGeneral toast={toast}/>}
          {tab === 'notif'        && <SettingsNotif toast={toast}/>}
          {tab === 'reminder'     && <SettingsReminders toast={toast}/>}
          {tab === 'integrations' && <SettingsIntegrations toast={toast}/>}
          {tab === 'rfid'         && <SettingsRFID toast={toast}/>}
          {tab === 'security'     && <SettingsSecurity toast={toast}/>}
          {tab === 'billing'      && <SettingsBilling toast={toast}/>}
        </div>
      </div>
    </div>
  );
}

function SettingsGeneral({toast}){
  return (
    <div className="card">
      <div className="card-h"><div className="card-t">General · Workspace</div></div>
      <div className="card-b">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
          {[
            {l:'Company name',  v:'PT. Indojaya Sentosa', edit:true},
            {l:'NPWP',              v:'01.234.567.8-001.000', edit:true},
            {l:'Workspace ID',     v:'wks_indojaya_001',     edit:false},
            {l:'Default currency',  v:'IDR · Indonesian Rupiah', edit:true},
            {l:'Default language', v:'English',                edit:true},
            {l:'Timezone',          v:'Asia/Jakarta · GMT+7',    edit:true},
            {l:'Fiscal year',      v:'1 Jan – 31 Dec',           edit:true},
            {l:'Date format',    v:'DD MMM YYYY',              edit:true},
          ].map((f,i)=>(
            <label key={i} style={{fontSize:11, fontWeight:600, color:'var(--text-2)'}}>
              {f.l}
              <input className="input" disabled={!f.edit} style={{display:'block', marginTop:5, width:'100%', opacity:f.edit?1:.6}} defaultValue={f.v}/>
            </label>
          ))}
        </div>

        <div style={{height:1, background:'var(--border)', margin:'20px 0'}}/>

        <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Asset numbering scheme</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
          {[
            {l:'Format', v:'[CAT]-[CODE]-[####]', sub:'IT-LP-9847'},
            {l:'Auto-increment', v:'Per category', sub:'resets yearly'},
            {l:'EPC pattern', v:'E280-1170-XXXX', sub:'GS1 SGTIN-96'},
          ].map((f,i)=>(
            <div key={i} className="stat" style={{padding:'10px 12px'}}>
              <div className="stat-l">{f.l}</div>
              <div className="mono" style={{fontSize:13, fontWeight:650}}>{f.v}</div>
              <div style={{fontSize:10, color:'var(--text-3)'}}>{f.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsNotif({toast}){
  return (
    <div className="card">
      <div className="card-h"><div className="card-t">Notifications · Channels & Triggers</div></div>
      <div className="card-b">
        <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Channels</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18}}>
          {[
            {l:'Email',         v:'notify@indojaya.id', on:true, icon:'send'},
            {l:'WhatsApp Bot',  v:'+62 812-3456-7890', on:true, icon:'phone'},
            {l:'Slack',          v:'#assets-ops · 14 users', on:true, icon:'send'},
            {l:'Microsoft Teams', v:'(not connected)', on:false, icon:'send'},
          ].map((c,i)=>(
            <div key={i} className="card" style={{padding:'12px 14px', background:'var(--surface-2)'}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div className={`ico ${c.on?'s':''}`} style={{width:28, height:28, borderRadius:6}}><Icon n={c.icon} s={12}/></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:600, fontSize:12}}>{c.l}</div>
                  <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{c.v}</div>
                </div>
                <Toggle on={c.on}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Triggers · when to notify</div>
        <table className="tbl">
          <thead><tr><th>Event</th><th>Recipient</th><th>Email</th><th>WhatsApp</th><th>Slack</th></tr></thead>
          <tbody>
            {[
              {ev:'Asset overdue for check-in',           who:'Custodian + Manager', e:true, w:true,  s:true},
              {ev:'PM due within 7 days',      who:'Maintenance team',    e:true, w:false, s:true},
              {ev:'Geofence breach detected',          who:'Security + Admin',    e:true, w:true,  s:true},
              {ev:'Audit variance found',          who:'Auditor + CFO',       e:true, w:false, s:false},
              {ev:'Disposal approval pending',       who:'Next approver',  e:true, w:true,  s:false},
              {ev:'Warranty expires within 30 days',      who:'Asset Manager',        e:true, w:false, s:false},
              {ev:'Insurance expires within 30 days',    who:'Finance',              e:true, w:false, s:true},
              {ev:'AI predicts failure within 30 days',     who:'Maintenance',           e:true, w:false, s:true},
            ].map((r,i)=>(
              <tr key={i}>
                <td style={{fontWeight:600, fontSize:12}}>{r.ev}</td>
                <td style={{fontSize:11.5, color:'var(--text-2)'}}>{r.who}</td>
                <td><Toggle on={r.e}/></td>
                <td><Toggle on={r.w}/></td>
                <td><Toggle on={r.s}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsReminders({toast}){
  const [ruleOpen, setRuleOpen] = useState(false);
  return (
    <div>
      <div className="card" style={{marginBottom:14}}>
        <div className="card-h">
          <div>
            <div className="card-t">Maintenance Reminder Rules</div>
            <div className="card-sub">Automatic rules that open WOs &amp; send reminders. The system auto-creates WOs on the configured interval.</div>
          </div>
          <button className="btn btn-sm btn-primary" onClick={()=>setRuleOpen(true)}><Icon n="plus" s={11}/>New rule</button>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Rule</th><th>Trigger</th><th>Interval</th><th>Reminder</th><th>Assign to</th><th>Status</th></tr>
          </thead>
          <tbody>
            {[
              {n:'Routine PM · IT Equipment',     trigger:'Every 6 months',          interval:'180 days',  rem:'14d · 7d · 1d',  ass:'IT Helpdesk',          on:true,  tone:'i'},
              {n:'Vehicle Service',                trigger:'Every 5,000 km / 6 months', interval:'180 days or odometer', rem:'30d · 7d',       ass:'Auto-dispatch Vendor',  on:true,  tone:'c'},
              {n:'Lab Instrument Calibration',   trigger:'Every 12 months',         interval:'365 days',  rem:'60d · 30d · 7d', ass:'Lab Manager',           on:true,  tone:'s'},
              {n:'Medical Device Inspection',     trigger:'Every 6 months',          interval:'180 days',  rem:'30d · 7d · 1d', ass:'Med Engineering',       on:true,  tone:'d'},
              {n:'Battery Replacement',          trigger:'1,800 cycles or 24 months',interval:'mixed',     rem:'90d · 14d',     ass:'Maintenance Team',     on:true,  tone:'w'},
              {n:'Annual Safety Inspection',     trigger:'Every 12 months',        interval:'365 days',  rem:'30d · 7d',       ass:'Safety Officer',        on:true,  tone:''},
              {n:'Filter HVAC',                   trigger:'Every 3 months',          interval:'90 days',   rem:'7d · 1d',         ass:'Facilities',            on:true,  tone:'p'},
              {n:'Warranty expiring',              trigger:'30 days before expiry',   interval:'30 days',   rem:'30d · 14d · 7d', ass:'Asset Manager',         on:true,  tone:'w'},
              {n:'Insurance renewal',             trigger:'45 days before expiry',   interval:'45 days',   rem:'45d · 14d',      ass:'Finance',                on:true,  tone:'s'},
              {n:'Fire Extinguisher Check',      trigger:'Every 3 months',          interval:'90 days',   rem:'7d',              ass:'Safety Officer',        on:false, tone:'d'},
            ].map((r,i)=>(
              <tr key={i} className="row-link">
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <div className={`ico ${r.tone||''}`} style={{width:30, height:30}}><Icon n="wrench" s={13}/></div>
                    <div>
                      <div style={{fontWeight:600, fontSize:12.5}}>{r.n}</div>
                      <div style={{fontSize:10, color:'var(--text-3)'}}>{r.trigger}</div>
                    </div>
                  </div>
                </td>
                <td style={{fontSize:11.5, color:'var(--text-2)'}}>{r.trigger}</td>
                <td className="mono" style={{fontSize:11}}>{r.interval}</td>
                <td>
                  <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                    {r.rem.split(' · ').map((rd,k)=><span key={k} className="b">{rd}</span>)}
                  </div>
                </td>
                <td style={{fontSize:11.5}}>{r.ass}</td>
                <td><Toggle on={r.on}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <div className="card">
          <div className="card-h"><div className="card-t">Upcoming reminders · 30 days</div></div>
          <div style={{padding:0}}>
            {[
              {d:'Tomorrow',     t:'PM IT Servers · Rack B · 8 unit',      tone:'d', sla:'24h'},
              {d:'3 days',    t:'PH Meter calibration · LB-PH-0008',     tone:'w', sla:'72h'},
              {d:'7 days',    t:'Forklift service · VH-FK-0041',         tone:'w', sla:'7d'},
              {d:'14 days',  t:'Annual Safety Insp · 24 ext. fire',    tone:'',  sla:'14d'},
              {d:'18 days',  t:'Medical inspection · ICU-2 · 4 units',   tone:'',  sla:'18d'},
              {d:'22 days',  t:'Filter HVAC · Floor 8-12',              tone:'',  sla:'22d'},
              {d:'28 days',  t:'Warranty expiring · 4 laptop batch Q1',   tone:'',  sla:'28d'},
            ].map((r,i)=>(
              <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:i<6?'1px solid var(--border-soft)':0}}>
                <div className={`ico ${r.tone||'i'}`} style={{width:28, height:28, borderRadius:6}}><Icon n="cal" s={12}/></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:600, fontSize:11.5}}>{r.t}</div>
                  <div style={{fontSize:10, color:'var(--text-3)'}}>{r.d} · SLA {r.sla}</div>
                </div>
                <button className="btn btn-sm" onClick={()=>toast('WO created for ' + r.t)}>Open WO</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h"><div className="card-t">Reminder defaults</div></div>
          <div className="card-b">
            <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>Default lead time per class</div>
            {[
              {k:'IT Equipment',     v:'30 days'},
              {k:'Vehicles',         v:'45 days'},
              {k:'Medical Devices',  v:'60 days'},
              {k:'Lab Instruments',  v:'90 days'},
              {k:'Industrial Mach.', v:'90 days'},
            ].map((d,i)=>(
              <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:i<4?'1px solid var(--border-soft)':0, fontSize:12}}>
                <span>{d.k}</span>
                <input className="input" defaultValue={d.v} style={{width:90, height:26, fontSize:11, padding:'4px 8px'}}/>
              </div>
            ))}

            <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:16, marginBottom:8}}>Auto-actions</div>
            {[
              {l:'Auto-create WO on reminder', on:true},
              {l:'Auto-assign an available technician', on:true},
              {l:'Lock asset if calibration is &gt; 30 days late', on:true},
              {l:'Escalate to supervisor if ignored for 7 days', on:false},
              {l:'Cc the CFO for assets &gt; Rp 50 jt', on:true},
            ].map((a,i)=>(
              <label key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:i<4?'1px solid var(--border-soft)':0, fontSize:11.5, cursor:'pointer'}}>
                <span dangerouslySetInnerHTML={{__html:a.l}}/>
                <Toggle on={a.on}/>
              </label>
            ))}
          </div>
        </div>
      </div>

      <PmRuleModal open={ruleOpen} onClose={()=>setRuleOpen(false)} toast={toast}/>
    </div>
  );
}

function SettingsIntegrations({toast}){
  return (
    <div className="card">
      <div className="card-h"><div className="card-t">Integrations · ERP &amp; External Systems</div></div>
      <div className="card-b">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {[
            {n:'Accurate Online',    desc:'Sync GL accounts · journal entries · BAST', cat:'ERP',         on:true,  last:'2m ago', icon:'db', tone:'s'},
            {n:'Odoo 17 Community',  desc:'Sync purchase orders · suppliers · stock',  cat:'ERP',         on:true,  last:'14m',    icon:'db', tone:'s'},
            {n:'SAP Business One',   desc:'GL account mapping · fixed asset module', cat:'ERP',          on:false, last:'never',   icon:'db', tone:'w'},
            {n:'Direktorat Jenderal Pajak', desc:'Form 1771 · PPh badan · E-Faktur', cat:'Tax',         on:true,  last:'monthly', icon:'shield', tone:'i'},
            {n:'BPJS Kesehatan',     desc:'Hospital-site assets · audit compliance', cat:'Compliance',    on:false, last:'never',   icon:'shield', tone:''},
            {n:'Zebra MotionWorks',  desc:'UHF Reader fleet · RTLS positioning',   cat:'RFID',          on:true,  last:'live',    icon:'radar', tone:'s'},
            {n:'SATO Online Services', desc:'Printer fleet health · OTA firmware', cat:'RFID',           on:true,  last:'live',    icon:'qr', tone:'s'},
            {n:'Microsoft Active Directory', desc:'SSO · custodian sync', cat:'IT',                    on:true,  last:'5m',      icon:'users', tone:'s'},
            {n:'Slack Workspace',    desc:'Push notifications · #assets-ops',     cat:'Notification',   on:true,  last:'1m',      icon:'send', tone:'s'},
            {n:'WhatsApp Business API', desc:'Reminders &amp; alerts to employees', cat:'Notification',   on:true,  last:'2h',      icon:'phone', tone:'s'},
          ].map((it,i)=>(
            <div key={i} style={{padding:14, border:'1px solid var(--border)', borderRadius:9, background:'var(--surface-2)', display:'flex', flexDirection:'column', gap:10}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div className={`ico ${it.tone||''}`} style={{width:34, height:34}}><Icon n={it.icon} s={15}/></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:650, fontSize:13}}>{it.n}</div>
                  <div style={{fontSize:10, color:'var(--text-3)'}}>{it.cat} · last sync {it.last}</div>
                </div>
                {it.on ? <span className="b s dot">Connected</span> : <span className="b">Disconnected</span>}
              </div>
              <div style={{fontSize:11.5, color:'var(--text-2)'}}>{it.desc}</div>
              <div style={{display:'flex', gap:6}}>
                <button className="btn btn-sm" style={{flex:1}} onClick={()=>toast(it.on?'Logs ' + it.n:'Connect ' + it.n)}>{it.on?'View logs':'Connect'}</button>
                {it.on && <button className="btn btn-sm" onClick={()=>toast('Settings ' + it.n)}>Settings</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsRFID({toast}){
  return (
    <div className="card">
      <div className="card-h"><div className="card-t">RFID Hardware · Readers, Antennas, Tags</div></div>
      <div className="card-b">
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
          <Stat label="UHF Readers" value="42" sub="40 online · 2 offline" tone="brand"/>
          <Stat label="Antennas" value="184" sub="avg RSSI −52 dBm" tone="success"/>
          <Stat label="Active tags" value="12,420" sub="98% coverage" tone="cyan"/>
          <Stat label="Daily reads" value="2,4M" sub="zero data loss" tone="success"/>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
          <div>
            <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Reader configuration</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {[
                {l:'Transmit power default', v:'30 dBm (FCC)', edit:true},
                {l:'Read mode',              v:'Dense reader · session 1',  edit:true},
                {l:'EPC encoding standard',  v:'GS1 SGTIN-96',                edit:true},
                {l:'Anti-collision',         v:'Q-algorithm · adaptive',     edit:true},
                {l:'Filter ghost reads',     v:'≥ 3 reads in 250ms',        edit:true},
              ].map((f,i)=>(
                <label key={i} style={{fontSize:11, fontWeight:600, color:'var(--text-2)'}}>
                  {f.l}
                  <input className="input" defaultValue={f.v} style={{display:'block', marginTop:4, width:'100%'}}/>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Tag type · default per category</div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {[
                {k:'IT Equipment',   t:'Hard tag (anti-metal)', mfg:'Confidex Survivor', cost:'Rp 28 rb'},
                {k:'Tools',          t:'Hard tag (anti-metal)', mfg:'Confidex Carrier', cost:'Rp 32 rb'},
                {k:'Furniture',      t:'Soft inlay (UCODE 9)',   mfg:'Avery RF600',      cost:'Rp 4 rb'},
                {k:'Vehicles',       t:'Industrial sealed tag', mfg:'HID IronStor',     cost:'Rp 84 rb'},
                {k:'Lab/Medical',    t:'Autoclave-safe tag',     mfg:'SATO IT80',         cost:'Rp 48 rb'},
              ].map((t,i)=>(
                <div key={i} style={{padding:'10px 12px', background:'var(--surface-2)', borderRadius:7}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <div style={{fontWeight:600, fontSize:12}}>{t.k}</div>
                    <span className="mono" style={{fontSize:11, color:'var(--cyan)'}}>{t.cost}/tag</span>
                  </div>
                  <div style={{fontSize:10.5, color:'var(--text-3)', marginTop:2}}>{t.t} · {t.mfg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSecurity({toast}){
  return (
    <div className="card">
      <div className="card-h"><div className="card-t">Security · Authentication &amp; Access</div></div>
      <div className="card-b">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
          {[
            {l:'Require MFA for Admin',                v:true},
            {l:'Require MFA for Finance',              v:true},
            {l:'Require MFA for Asset Manager',       v:true},
            {l:'SSO via Microsoft Azure AD',          v:true},
            {l:'Auto-lockout after 5 failed logins', v:true},
            {l:'Session timeout · 8 hours',                v:true},
            {l:'IP whitelist (office + VPN)',         v:false},
            {l:'Require password reset every 90 days', v:false},
          ].map((s,i)=>(
            <label key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'var(--surface-2)', borderRadius:7, fontSize:12, cursor:'pointer'}}>
              <span>{s.l}</span>
              <Toggle on={s.v}/>
            </label>
          ))}
        </div>

        <div style={{height:1, background:'var(--border)', margin:'18px 0'}}/>

        <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>API Keys · Programmatic access</div>
        {[
          {n:'Accurate sync (read-write)', key:'ak_live_••••••••8a4f', scope:'Read+Write', last:'2m ago', tone:'s'},
          {n:'Odoo connector',                key:'ak_live_••••••••2c1b', scope:'Read+Write', last:'14m ago', tone:'s'},
          {n:'Mobile audit (TC22)',          key:'ak_live_••••••••9d8e', scope:'Read+Write', last:'5h ago', tone:'s'},
          {n:'Power BI dashboard',           key:'ak_live_••••••••4f2a', scope:'Read-only',   last:'1 day',  tone:''},
        ].map((k,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--surface-2)', borderRadius:7, marginBottom:6}}>
            <div className="ico s" style={{width:28, height:28}}><Icon n="lock" s={12}/></div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:12, fontWeight:600}}>{k.n}</div>
              <div className="mono" style={{fontSize:10.5, color:'var(--text-3)'}}>{k.key} · {k.scope}</div>
            </div>
            <span style={{fontSize:10.5, color:'var(--text-3)'}}>used {k.last}</span>
            <button className="btn btn-sm" onClick={()=>toast('API key rotated · clients must update')}>Rotate</button>
          </div>
        ))}
        <button className="btn btn-sm btn-primary" style={{marginTop:10}} onClick={()=>toast('New API key generated · copy &amp; store it securely')}><Icon n="plus" s={11}/>Generate new key</button>
      </div>
    </div>
  );
}

function SettingsBilling({toast}){
  return (
    <div className="card">
      <div className="card-h"><div className="card-t">Billing · Subscription</div></div>
      <div className="card-b">
        <div style={{padding:18, background:'linear-gradient(135deg, var(--brand-soft), var(--cyan-soft))', borderRadius:10, border:'1px solid rgba(59,130,246,.3)', marginBottom:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
            <div>
              <div style={{fontSize:11, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Current plan</div>
              <div className="display" style={{fontSize:24, fontWeight:650, marginTop:4}}>Enterprise · Annual</div>
              <div style={{fontSize:11.5, color:'var(--text-2)', marginTop:4}}>Unlimited assets · 25 users · SSO · API · Premium support</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="mono display" style={{fontSize:22, fontWeight:650, color:'var(--cyan)'}}>{formatIDRShort(180000000)}</div>
              <div style={{fontSize:11, color:'var(--text-3)'}}>per year · billed annually</div>
            </div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-sm" onClick={()=>toast('Subscription invoice detail · Enterprise plan')}>View detail</button>
            <button className="btn btn-sm" onClick={()=>toast('Invoice PDF downloaded')}>Download invoice</button>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
          <Stat label="Assets tracked" value="12,420" sub="of unlimited" tone="brand"/>
          <Stat label="Active users" value="142 / 250" sub="seat included"/>
          <Stat label="Renewal" value="14 Mar 2026" sub="auto-renew on" tone="warn"/>
        </div>
      </div>
    </div>
  );
}

/* Toggle component */
function Toggle({on:initial, onChange}){
  const [on, setOn] = useState(initial);
  return (
    <button style={{
      width:32, height:18, borderRadius:99,
      background: on ? 'var(--brand)' : 'var(--surface-3)',
      transition:'all .15s', flexShrink:0, position:'relative',
      boxShadow: on ? 'inset 0 0 0 1px rgba(255,255,255,.1), 0 0 8px rgba(59,130,246,.3)' : 'inset 0 0 0 1px var(--border)',
    }} onClick={(e)=>{e.stopPropagation(); setOn(!on); onChange?.(!on);}}>
      <span style={{
        position:'absolute', top:2, left: on ? 16 : 2, width:14, height:14,
        background:'white', borderRadius:50, transition:'left .15s',
        boxShadow:'0 1px 3px rgba(0,0,0,.3)',
      }}/>
    </button>
  );
}

/* --- RFID TAGS (Whitelist + Print Queue + Print Station) --- */
function RFIDTagsPage({navigate, toast}){
  const [tab, setTab] = useState('whitelist');
  const [epcOpen, setEpcOpen] = useState(false);
  const tabs = [
    {id:'whitelist', l:'Whitelist · EPC Register'},
    {id:'queue',     l:'Print Queue · 24'},
    {id:'station',   l:'Print Station'},
    {id:'stock',     l:'Tag Stock'},
  ];
  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">RFID Tags · Register &amp; Print</h1>
          <p className="page-desc">EPC whitelist (GS1 SGTIN-96 register) · bulk print queue · live print station · physical tag stock. Only whitelisted EPCs can be encoded by the system.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast('GS1 registry synced · 142 new prefixes resolved')}><Icon n="refresh" s={13}/>Sync GS1</button>
          <button className="btn" onClick={()=>toast('EPC whitelist exported to CSV')}><Icon n="dl" s={13}/>Export</button>
          <button className="btn btn-primary" onClick={()=>setEpcOpen(true)}><Icon n="plus" s={13}/>Register EPC range</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
        <Stat label="Active EPC ranges" value="14" sub="3 GS1 prefix · 11 sub-pattern" tone="brand" icon="tag"/>
        <Stat label="Tags printed today" value="284" sub="3 printer · zero defect" tone="success" icon="qr"/>
        <Stat label="Print queue" value="24" sub="8 IT · 12 furniture · 4 lab" tone="warn" icon="cal"/>
        <Stat label="Physical tag stock" value="6,840" sub="~30 days of supply" tone="cyan" icon="box"/>
      </div>

      <div className="tabs">
        {tabs.map(t=>(
          <button key={t.id} className={`tab ${tab===t.id?'on':''}`} onClick={()=>setTab(t.id)}>{t.l}</button>
        ))}
      </div>

      {tab === 'whitelist' && <RFIDWhitelist toast={toast}/>}
      {tab === 'queue'     && <RFIDQueue toast={toast}/>}
      {tab === 'station'   && <RFIDStation toast={toast}/>}
      {tab === 'stock'     && <RFIDStock toast={toast}/>}

      <EpcRangeModal open={epcOpen} onClose={()=>setEpcOpen(false)} toast={toast}/>
    </div>
  );
}

function RFIDWhitelist({toast}){
  const [sel, setSel] = useState(0);
  const ranges = [
    {prefix:'8990012', cat:'IT Equipment',    pattern:'E280-1170-XXXX-IT-####',  used:4820, max:65536, status:'active', owner:'Bambang W.', enc:'GS1 SGTIN-96'},
    {prefix:'8990012', cat:'Tools',            pattern:'E280-1170-XXXX-TL-####',  used:2140, max:65536, status:'active', owner:'Andi P.',     enc:'GS1 SGTIN-96'},
    {prefix:'8990012', cat:'Furniture',        pattern:'E280-1170-XXXX-FU-####',  used:2840, max:65536, status:'active', owner:'Facilities',  enc:'GS1 SGTIN-96'},
    {prefix:'8990012', cat:'Vehicles',         pattern:'E280-1170-XXXX-VH-####',  used:842,  max:9999,  status:'active', owner:'Andi P.',     enc:'GS1 SGTIN-96'},
    {prefix:'8990013', cat:'Lab Instruments',  pattern:'E280-1170-XXXX-LB-####',  used:620,  max:9999,  status:'active', owner:'Dr. Ratna',   enc:'ISO 17363'},
    {prefix:'8990013', cat:'Medical Devices',  pattern:'E280-1170-XXXX-MD-####',  used:248,  max:9999,  status:'active', owner:'Med Eng',     enc:'ISO 17363'},
    {prefix:'8990014', cat:'Industrial Mach.', pattern:'E280-1170-XXXX-MC-####',  used:186,  max:999,   status:'active', owner:'Eko P.',      enc:'GS1 SGTIN-96'},
    {prefix:'9999999', cat:'(Legacy Avery)',  pattern:'E200-XXXX-XXXX-XXXX',     used:0,    max:0,     status:'revoked',owner:'(retired)',   enc:'EPC Gen1'},
  ];
  const r = ranges[sel];
  return (
    <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:14}}>
      <div className="card">
        <div className="card-h">
          <div className="card-t">EPC whitelist · approved ranges</div>
          <span className="b s dot">7 active · 1 revoked</span>
        </div>
        <table className="tbl">
          <thead><tr><th>Category</th><th>EPC pattern</th><th>GS1 prefix</th><th>Used</th><th>Encoding</th><th>Status</th></tr></thead>
          <tbody>
            {ranges.map((rr,i)=>(
              <tr key={i} className={`row-link ${sel===i?'sel':''}`} onClick={()=>setSel(i)}>
                <td style={{fontWeight:600, fontSize:12.5}}>{rr.cat}</td>
                <td className="mono" style={{fontSize:10.5, color:'var(--brand-strong)'}}>{rr.pattern}</td>
                <td className="mono" style={{fontSize:11}}>{rr.prefix}</td>
                <td className="mono" style={{fontSize:11}}>
                  {rr.max > 0 ? (
                    <>
                      <div>{rr.used.toLocaleString()} / {rr.max.toLocaleString()}</div>
                      <div className="meter" style={{width:60, marginTop:3}}><div className={`meter-f ${(rr.used/rr.max)*100>80?'danger':'brand'}`} style={{width:`${(rr.used/rr.max)*100}%`}}/></div>
                    </>
                  ) : '—'}
                </td>
                <td><span className="b">{rr.enc}</span></td>
                <td><span className={`b ${rr.status==='active'?'s':'d'} dot`}>{rr.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">{r.cat}</div>
            <div className="card-sub mono">{r.pattern}</div>
          </div>
          <button className="btn btn-sm" onClick={()=>toast('Edit EPC range')}>Edit</button>
        </div>
        <div className="card-b">
          <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'7px 12px', fontSize:11.5, marginBottom:14}}>
            <span style={{color:'var(--text-3)'}}>GS1 Prefix</span><b className="mono">{r.prefix}</b>
            <span style={{color:'var(--text-3)'}}>Encoding</span><b>{r.enc}</b>
            <span style={{color:'var(--text-3)'}}>Owner</span><b>{r.owner}</b>
            <span style={{color:'var(--text-3)'}}>Allocation</span><b className="mono">{r.used.toLocaleString()} / {r.max.toLocaleString() || '—'}</b>
            <span style={{color:'var(--text-3)'}}>Available</span><b className="mono" style={{color:'var(--success)'}}>{(r.max - r.used).toLocaleString()}</b>
            <span style={{color:'var(--text-3)'}}>Status</span><b style={{color: r.status==='active'?'var(--success)':'var(--danger)'}}>{r.status.toUpperCase()}</b>
          </div>

          <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>Validation rules</div>
          <div className="card" style={{padding:10, background:'var(--surface-2)', fontSize:11, lineHeight:1.6}}>
            <div>✓ EPC <b>must</b> match pattern <span className="mono">{r.pattern}</span></div>
            <div>✓ Only whitelisted printers may encode</div>
            <div>✓ Tags must be registered in EPCIS before activation</div>
            <div>✓ Auto-reject duplicate EPC</div>
            <div>✓ Every encode is audit-logged</div>
          </div>

          <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:14, marginBottom:8}}>Activity · 7 days</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:10.5}}>
            <div className="card" style={{padding:10, background:'var(--surface-2)'}}>
              <div style={{color:'var(--text-3)'}}>Encoded</div>
              <div className="mono" style={{fontSize:16, fontWeight:650, color:'var(--success)'}}>+184</div>
            </div>
            <div className="card" style={{padding:10, background:'var(--surface-2)'}}>
              <div style={{color:'var(--text-3)'}}>Rejected</div>
              <div className="mono" style={{fontSize:16, fontWeight:650, color:'var(--danger)'}}>4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RFIDQueue({toast}){
  const jobs = [
    {id:'PRT-2410-024', cat:'IT',   asset:'MacBook Pro 16" batch', qty:24, printer:'Zebra ZT411 · IT-A', pri:'urgent', status:'printing', prog:62},
    {id:'PRT-2410-023', cat:'tool', asset:'Hilti Drill TE 6-A22',   qty:12, printer:'Zebra ZT411 · WS',  pri:'high',   status:'queued',   prog:0},
    {id:'PRT-2410-022', cat:'furn', asset:'Aeron Chair batch Q1',   qty:48, printer:'SATO CL4NX',         pri:'med',    status:'queued',   prog:0},
    {id:'PRT-2410-021', cat:'lab',  asset:'PH Meter Mettler',        qty:4,  printer:'SATO CL4NX',         pri:'med',    status:'queued',   prog:0},
    {id:'PRT-2410-020', cat:'it',   asset:'Dell Latitude 7440',     qty:18, printer:'Zebra ZT411 · IT-B', pri:'med',    status:'completed',prog:100},
    {id:'PRT-2410-019', cat:'med',  asset:'Philips IntelliVue',     qty:2,  printer:'SATO CL4NX',         pri:'low',    status:'completed',prog:100},
    {id:'PRT-2410-018', cat:'veh',  asset:'Toyota Forklift tag',    qty:1,  printer:'Zebra ZT411 · WH',  pri:'low',    status:'failed',   prog:48},
  ];
  return (
    <div className="card">
      <div className="card-h">
        <div className="card-t">Print queue · 24 jobs</div>
        <div style={{display:'flex', gap:6}}>
          <button className="btn btn-sm" onClick={()=>toast('Pause all print jobs')}><Icon n="pause" s={11}/>Pause all</button>
          <button className="btn btn-sm btn-primary" onClick={()=>toast('Printing 24 jobs · 4 printers · est. 8 minutes')}><Icon n="qr" s={11}/>Print queue</button>
        </div>
      </div>
      <table className="tbl">
        <thead><tr><th>Job ID</th><th>Asset</th><th>Qty</th><th>Printer</th><th>Priority</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {jobs.map((j,i)=>(
            <tr key={i}>
              <td>
                <div className="mono" style={{fontWeight:600, fontSize:11.5}}>{j.id}</div>
                <div style={{display:'flex', alignItems:'center', gap:6, marginTop:3}}>
                  <div className={`ico ${catTone[j.cat]}`} style={{width:18, height:18, borderRadius:4}}><Icon n={catIcon[j.cat]} s={9}/></div>
                  <span className="b" style={{fontSize:9}}>{catLabel[j.cat]}</span>
                </div>
              </td>
              <td style={{fontWeight:600, fontSize:12}}>{j.asset}</td>
              <td className="mono" style={{fontWeight:600}}>{j.qty}</td>
              <td style={{fontSize:11, color:'var(--text-2)'}}>{j.printer}</td>
              <td><span className={`b ${j.pri==='urgent'?'d':j.pri==='high'?'w':j.pri==='med'?'i':''}`}>{j.pri.toUpperCase()}</span></td>
              <td>
                <span className={`b ${j.status==='completed'?'s':j.status==='printing'?'i':j.status==='failed'?'d':''} dot`}>{j.status}</span>
                {j.status==='printing' && (
                  <div className="meter" style={{width:90, marginTop:4}}>
                    <div className="meter-f brand" style={{width:`${j.prog}%`}}/>
                  </div>
                )}
              </td>
              <td>
                {j.status === 'failed'
                  ? <button className="btn btn-sm" onClick={()=>toast('Retry print job ' + j.id)}><Icon n="refresh" s={11}/>Retry</button>
                  : j.status === 'queued'
                    ? <button className="btn btn-sm btn-primary" onClick={()=>toast('Start print job ' + j.id)}><Icon n="play" s={11}/>Print</button>
                    : <button className="btn btn-sm btn-ghost" onClick={()=>toast('Job details ' + j.id)}>Detail</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RFIDStation({toast}){
  const [printing, setPrinting] = useState(false);
  const [done, setDone] = useState(0);
  const target = 24;

  const handlePrint = () => {
    setPrinting(true);
    setDone(0);
    const interval = setInterval(() => {
      setDone(d => {
        if (d + 1 >= target) {
          clearInterval(interval);
          setPrinting(false);
          toast(`${target} tags printed \u00b7 ready to attach`);
          return target;
        }
        return d + 1;
      });
    }, 180);
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
      <div className="card">
        <div className="card-h">
          <div className="card-t">Live label preview</div>
          <span className="b">2"x1" thermal · Zebra ZT411</span>
        </div>
        <div className="card-b">
          <div style={{
            background:'#fff', color:'#000', padding:14, borderRadius:8,
            border:'1px solid var(--border-strong)',
            fontFamily:'Geist Mono, monospace',
            position:'relative', maxWidth:340, margin:'0 auto',
          }}>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:9, fontWeight:700, letterSpacing:'.04em'}}>PT. INDOJAYA · KATALYST</div>
                <div style={{fontSize:13, fontWeight:700, marginTop:6, letterSpacing:'-.01em'}}>MacBook Pro 16" M3 Max</div>
                <div style={{fontSize:9, marginTop:2}}>IT Equipment · Engineering</div>
                <div style={{fontSize:14, fontWeight:700, marginTop:8, fontFamily:'Geist Mono', letterSpacing:'.02em'}}>IT-LP-9847</div>
                <div style={{display:'flex', gap:1, marginTop:4, height:28}}>
                  {Array.from({length:42}, (_,k) => <div key={k} style={{width:2, height:'100%', background: Math.random() > .5 ? '#000' : 'transparent'}}/>)}
                </div>
                <div style={{fontSize:8, fontWeight:600, marginTop:3, textAlign:'center', letterSpacing:'.1em'}}>9990012-IT-9847</div>
              </div>
              <div style={{width:62, flexShrink:0}}>
                <div style={{
                  width:62, height:62, background:'#fff', border:'1px solid #000', padding:3,
                  display:'grid', gridTemplateColumns:'repeat(8,1fr)', gridTemplateRows:'repeat(8,1fr)',
                }}>
                  {Array.from({length:64}, (_,i) => (
                    <div key={i} style={{background: ((i*7 + 1) % 3 === 0) ? '#000' : 'transparent'}}/>
                  ))}
                </div>
                <div style={{fontSize:7.5, fontWeight:600, marginTop:2, textAlign:'center'}}>SCAN</div>
              </div>
            </div>
            <div style={{borderTop:'1px dashed #999', marginTop:8, paddingTop:6, fontSize:8, display:'flex', justifyContent:'space-between'}}>
              <span>EPC: E280-1170-XXXX-IT-9847</span>
              <span>RFID UHF 915MHz</span>
            </div>
          </div>

          <div style={{fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:18, marginBottom:8}}>Label contains</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:5}}>
            {[
              {icon:'qr',    l:'QR code (asset URL)'},
              {icon:'radar', l:'UHF RFID chip (encoded)'},
              {icon:'tag',   l:'Barcode (Code128)'},
              {icon:'box',   l:'Human-readable asset info'},
              {icon:'building',l:'Company branding'},
              {icon:'shield', l:'Tamper-evident finish'},
            ].map((f,i)=>(
              <div key={i} style={{display:'flex', alignItems:'center', gap:7, padding:'6px 9px', background:'var(--surface-2)', borderRadius:5, fontSize:10.5}}>
                <Icon n={f.icon} s={11}/>{f.l}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="card-t">Print station · Zebra ZT411 · IT-A</div>
          <span className={`b ${printing?'i':'s'} dot`}>{printing?'Printing':'Ready'}</span>
        </div>
        <div className="card-b">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14}}>
            <Stat label="Status printer" value="Online" sub="Zebra ZT411 v8.2.1" tone="success"/>
            <Stat label="Paper level" value="84%" sub="Roll 4x6 thermal · 1,200 labels" tone="success"/>
            <Stat label="Ribbon" value="62%" sub="Black 110mm wax · 240m" tone="success"/>
            <Stat label="RF check" value="OK" sub="−42 dBm avg encode" tone="success"/>
          </div>

          <div style={{padding:14, borderRadius:9, background:'var(--surface-2)', border:'1px solid var(--border)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
              <div>
                <div style={{fontWeight:650, fontSize:13}}>Active job · PRT-2410-024</div>
                <div style={{fontSize:11, color:'var(--text-3)', marginTop:2}}>MacBook Pro 16" · qty 24 · PO-2025-0042</div>
              </div>
              <div className="display" style={{fontSize:24, fontWeight:650, color:'var(--brand-strong)'}}>
                {done}<span style={{color:'var(--text-3)', fontSize:14}}> / {target}</span>
              </div>
            </div>
            <Meter pct={(done/target)*100} tone="brand"/>
            <div style={{fontSize:10.5, color:'var(--text-3)', marginTop:6}}>
              {printing ? `Encoding tag #${done+1} · auto-verify after each` : done === target ? '✓ Done — ready to attach to assets' : 'Ready · click the button to start'}
            </div>
          </div>

          <div style={{display:'flex', gap:8, marginTop:14}}>
            <button className="btn" style={{flex:1}} onClick={()=>toast('Print 1 test label')}><Icon n="qr" s={12}/>Test print</button>
            <button className="btn" style={{flex:1}} disabled={printing} onClick={()=>{setDone(0); setPrinting(false); toast('Job reset');}}><Icon n="refresh" s={12}/>Reset</button>
            <button className="btn btn-primary" style={{flex:2}} disabled={printing} onClick={handlePrint}>
              <Icon n={printing?'pause':'play'} s={12}/>{printing ? 'Printing\u2026' : `Print ${target} tags`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RFIDStock({toast}){
  const [orderOpen, setOrderOpen] = useState(false);
  return (
    <div className="card">
      <div className="card-h">
        <div className="card-t">Physical RFID tag stock</div>
        <button className="btn btn-sm btn-primary" onClick={()=>setOrderOpen(true)}><Icon n="plus" s={11}/>Order stock</button>
      </div>
      <table className="tbl">
        <thead><tr><th>Tag type</th><th>For Category</th><th>Vendor</th><th style={{textAlign:'right'}}>Stock</th><th>Status</th><th style={{textAlign:'right'}}>Cost/tag</th></tr></thead>
        <tbody>
          {[
            {t:'Confidex Survivor', cat:'IT', vendor:'PT. Confidex ID', stock:2840, low:500, cost:28000},
            {t:'Confidex Carrier',  cat:'Tools', vendor:'PT. Confidex ID', stock:1240, low:300, cost:32000},
            {t:'Avery RF600 inlay',  cat:'Furniture', vendor:'PT. Avery Indonesia', stock:1840, low:500, cost:4000},
            {t:'HID IronStor',       cat:'Vehicles', vendor:'PT. HID Global', stock:184, low:50, cost:84000},
            {t:'SATO IT80 autoclave',cat:'Lab/Medical', vendor:'PT. SATO Indonesia', stock:420, low:100, cost:48000},
            {t:'Anti-metal hardened',cat:'Machinery', vendor:'PT. Confidex ID', stock:48, low:50, cost:118000},
          ].map((s,i)=>(
            <tr key={i} className="row-link">
              <td>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div className="ico i" style={{width:28, height:28, borderRadius:6}}><Icon n="tag" s={12}/></div>
                  <div style={{fontWeight:600, fontSize:12.5}}>{s.t}</div>
                </div>
              </td>
              <td><span className="b">{s.cat}</span></td>
              <td style={{fontSize:11.5, color:'var(--text-2)'}}>{s.vendor}</td>
              <td className="mono" style={{textAlign:'right', fontWeight:600, color: s.stock<=s.low?'var(--danger)':'var(--text)'}}>{s.stock.toLocaleString()}</td>
              <td>{s.stock<=s.low ? <span className="b d dot">Restock</span> : <span className="b s dot">OK</span>}</td>
              <td className="mono" style={{textAlign:'right', color:'var(--cyan)'}}>{formatIDR(s.cost).replace('Rp ','Rp ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <OrderStockModal open={orderOpen} onClose={()=>setOrderOpen(false)} toast={toast}/>
    </div>
  );
}

/* ============================================================
   --- DOCUMENTATION · HELP CENTER ---
   Bilingual EN / ID guide to the entire platform.
   Structure: side-nav with sections, right column with content.
============================================================ */
function DocsPage({navigate, toast, lang, setLang}){
  const [section, setSection] = useState('start');
  const en = lang === 'en';
  const T = (e, i) => en ? e : i;

  const sections = [
    {group: T('Get oriented','Mulai dari sini'), items:[
      {id:'start',    icon:'sparkles', l:T('Getting Started','Mulai Cepat')},
      {id:'register-flow', icon:'qr',  l:T('Register RFID & Assets','Daftar RFID & Aset')},
      {id:'flow',     icon:'radar',    l:T('End-to-End Lifecycle','Alur End-to-End')},
      {id:'concepts', icon:'box',      l:T('Core Concepts','Konsep Inti')},
    ]},
    {group: T('Platform','Platform'), items:[
      {id:'features', icon:'dash',     l:T('Features & Capabilities','Fitur & Kemampuan')},
      {id:'why',      icon:'zap',      l:T('Why Katalyst · vs others','Kenapa Katalyst · vs lain')},
    ]},
    {group: T('How to use each module','Cara pakai tiap modul'), items:[
      {id:'register', icon:'box',     l:T('Asset Register','Daftar Aset')},
      {id:'in',       icon:'arrin',   l:T('Scan-In · Receiving','Scan-In · Penerimaan')},
      {id:'out',      icon:'arrout',  l:T('Scan-Out · Disposal','Scan-Out · Pelepasan')},
      {id:'checkout', icon:'swap',    l:T('Check-Out · Loans','Check-Out · Peminjaman')},
      {id:'transfer', icon:'swap',    l:T('Transfer','Mutasi Aset')},
      {id:'audit',    icon:'audit',   l:T('Stock Audit','Stock Opname')},
      {id:'maint',    icon:'wrench',  l:T('Maintenance · CMMS','Maintenance · CMMS')},
      {id:'rtls',     icon:'pin',     l:T('Real-Time Location','Lokasi Real-Time')},
      {id:'security', icon:'shield',  l:T('Loss Prevention','Loss Prevention')},
      {id:'users',    icon:'users',   l:T('User Management','Manajemen User')},
      {id:'reports',  icon:'doc',     l:T('Reports','Laporan')},
    ]},
    {group: T('Reference','Referensi'), items:[
      {id:'roadmap',  icon:'sparkles',l:T('Roadmap · Rollout','Roadmap · Rilis')},
      {id:'faq',      icon:'help',    l:T('FAQ','FAQ')},
      {id:'glossary', icon:'tag',     l:T('Glossary · RFID Terms','Daftar Istilah · RFID')},
    ]},
  ];

  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">{T('Documentation','Dokumentasi')}</h1>
          <p className="page-desc">
            {T(
              'Complete guide to Katalyst Fixed Assets. Learn how RFID, Scan-In/Out, Transfer, Maintenance, and Work Orders connect — and how to use each module day-to-day.',
              'Panduan lengkap Katalyst Fixed Assets. Pelajari bagaimana RFID, Scan-In/Out, Mutasi, Maintenance, dan Work Order saling terhubung — serta cara pakai tiap modul sehari-hari.'
            )}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>toast(en?'Open offline PDF · 142 pages':'Buka PDF offline · 142 hal.')}><Icon n="dl" s={13}/>PDF</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'220px 1fr', gap:18, alignItems:'flex-start'}}>
        {/* Side nav */}
        <aside style={{position:'sticky', top:68, alignSelf:'flex-start'}}>
          <div className="card" style={{padding:8}}>
            {sections.map((g, gi) => (
              <div key={gi}>
                <div style={{fontSize:9.5, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', padding:'10px 10px 5px'}}>{g.group}</div>
                {g.items.map(it => (
                  <button key={it.id} onClick={()=>setSection(it.id)}
                    style={{display:'flex', alignItems:'center', gap:8, padding:'7px 9px', borderRadius:6, fontSize:12, fontWeight: section===it.id?600:500,
                      width:'100%', textAlign:'left',
                      color: section===it.id?'var(--brand-strong)':'var(--text-2)',
                      background: section===it.id?'var(--brand-soft)':'transparent',
                      boxShadow: section===it.id?'inset 2px 0 0 var(--brand)':'none'}}>
                    <Icon n={it.icon} s={12}/>{it.l}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main style={{minWidth:0}}>
          {section === 'start'    && <DocsGettingStarted T={T} en={en} navigate={navigate}/>}
          {section === 'register-flow' && <DocsRegisterFlow T={T} en={en} navigate={navigate}/>}
          {section === 'features' && <DocsFeatures T={T} en={en} navigate={navigate}/>}
          {section === 'why'      && <DocsWhy T={T} en={en} navigate={navigate}/>}
          {section === 'flow'     && <DocsFlow T={T} en={en} navigate={navigate}/>}
          {section === 'concepts' && <DocsConcepts T={T} en={en} navigate={navigate}/>}
          {section === 'register' && <DocsModule T={T} en={en} navigate={navigate} m="register"/>}
          {section === 'in'       && <DocsModule T={T} en={en} navigate={navigate} m="in"/>}
          {section === 'out'      && <DocsModule T={T} en={en} navigate={navigate} m="out"/>}
          {section === 'checkout' && <DocsModule T={T} en={en} navigate={navigate} m="checkout"/>}
          {section === 'transfer' && <DocsModule T={T} en={en} navigate={navigate} m="transfer"/>}
          {section === 'audit'    && <DocsModule T={T} en={en} navigate={navigate} m="audit"/>}
          {section === 'maint'    && <DocsModule T={T} en={en} navigate={navigate} m="maint"/>}
          {section === 'rtls'     && <DocsModule T={T} en={en} navigate={navigate} m="rtls"/>}
          {section === 'security' && <DocsModule T={T} en={en} navigate={navigate} m="security"/>}
          {section === 'users'    && <DocsModule T={T} en={en} navigate={navigate} m="users"/>}
          {section === 'reports'  && <DocsModule T={T} en={en} navigate={navigate} m="reports"/>}
          {section === 'roadmap'  && <DocsRoadmap T={T} en={en} navigate={navigate}/>}
          {section === 'faq'      && <DocsFAQ T={T} en={en}/>}
          {section === 'glossary' && <DocsGlossary T={T} en={en}/>}
        </main>
      </div>
    </div>
  );
}

/* Small helpers for docs typography */
const DocH = ({children}) => <h2 className="display" style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 8px'}}>{children}</h2>;
const DocLead = ({children}) => <p style={{fontSize:13, color:'var(--text-2)', margin:'0 0 22px', lineHeight:1.6, maxWidth:700}}>{children}</p>;
const DocH3 = ({children, n}) => (
  <h3 style={{fontSize:14, fontWeight:600, margin:'24px 0 10px', display:'flex', alignItems:'center', gap:10}}>
    {n && <span style={{display:'grid', placeItems:'center', width:22, height:22, borderRadius:5, background:'var(--brand-soft)', color:'var(--brand-strong)', fontSize:11, fontFamily:'JetBrains Mono', fontWeight:700}}>{n}</span>}
    {children}
  </h3>
);
const DocP = ({children}) => <p style={{fontSize:12.5, color:'var(--text-2)', margin:'0 0 10px', lineHeight:1.65}}>{children}</p>;
const DocCallout = ({tone='i', icon='sparkles', title, children}) => (
  <div style={{padding:14, background:`color-mix(in oklab, var(--${tone==='d'?'danger':tone==='w'?'warn':tone==='s'?'success':'brand'}-soft) 60%, var(--surface-2))`,
    border:`1px solid color-mix(in oklab, var(--${tone==='d'?'danger':tone==='w'?'warn':tone==='s'?'success':'brand'}) 24%, var(--border))`,
    borderRadius:9, margin:'12px 0', display:'flex', gap:11, alignItems:'flex-start'}}>
    <div className={`ico ${tone}`} style={{width:30, height:30, flexShrink:0}}><Icon n={icon} s={13}/></div>
    <div style={{minWidth:0}}>
      {title && <div style={{fontSize:12.5, fontWeight:650, marginBottom:3}}>{title}</div>}
      <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.6}}>{children}</div>
    </div>
  </div>
);
const DocStep = ({n, title, children}) => (
  <div style={{display:'flex', gap:12, marginBottom:14}}>
    <div style={{flexShrink:0, width:28, height:28, borderRadius:7, background:'var(--brand)', color:'white', display:'grid', placeItems:'center', fontFamily:'Space Grotesk', fontWeight:600, fontSize:13, boxShadow:'0 2px 8px -1px rgba(59,130,246,.4)'}}>{n}</div>
    <div style={{flex:1, minWidth:0, paddingTop:3}}>
      <div style={{fontSize:13, fontWeight:600, marginBottom:3}}>{title}</div>
      <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.6}}>{children}</div>
    </div>
  </div>
);
const DocPill = ({onClick, children, icon}) => (
  <button onClick={onClick} className="btn btn-sm" style={{marginRight:6, marginTop:6}}>
    {icon && <Icon n={icon} s={11}/>}{children}
  </button>
);

/* === SECTION: Register RFID & Assets (client onboarding flow) === */
function DocsRegisterFlow({T, en, navigate}){
  const phases = [
    {
      tag:'A', tone:'i', t:T('Set up the foundation (one time)','Siapkan fondasi (sekali saja)'),
      steps:[
        {t:T('Define master data','Definisikan master data'),
         d:T('Locations, categories, custodians, cost centers, suppliers. Import from CSV if you already have a list.','Lokasi, kategori, custodian, cost center, supplier. Import dari CSV jika sudah ada daftar.'),
         go:'masterdata', goL:T('Master Data','Master Data')},
        {t:T('Allocate an EPC range','Alokasikan range EPC'),
         d:T('From your GS1 company prefix, reserve a block of 96-bit EPCs. Katalyst auto-assigns the next free code per asset.','Dari prefix GS1 perusahaan, reservasi blok EPC 96-bit. Katalyst auto-assign kode bebas berikutnya per aset.'),
         go:'rfid', goL:T('RFID Tags','Tag RFID')},
        {t:T('Choose tag types','Pilih jenis tag'),
         d:T('Hard tags for machinery/metal, label tags for IT & furniture, windshield tags for vehicles. Each is mapped to a category default.','Hard tag untuk mesin/logam, label tag untuk IT & furniture, windshield tag untuk kendaraan. Tiap jenis dipetakan ke default kategori.')},
      ],
    },
    {
      tag:'B', tone:'s', t:T('Register an asset + its RFID tag','Daftarkan aset + tag RFID-nya'),
      steps:[
        {t:T('Open Scan-In · Receiving','Buka Scan-In · Penerimaan'),
         d:T('Pick the matching PO (or "walk-in" for existing assets). Line items pre-fill name, qty, supplier, and value.','Pilih PO yang cocok (atau "walk-in" untuk aset existing). Line item auto-isi nama, qty, supplier, dan nilai.'),
         go:'scan-in', goL:T('Scan-In','Scan-In')},
        {t:T('Encode & apply the tag','Encode & tempel tag'),
         d:T('Print the tag at the Zebra station — Katalyst writes the EPC and locks it (TID). Stick it on the asset in the recommended spot.','Cetak tag di stasiun Zebra — Katalyst tulis EPC dan kunci (TID). Tempel di aset pada titik yang disarankan.')},
        {t:T('Scan to confirm','Scan untuk konfirmasi'),
         d:T('Read the freshly-tagged asset through the gate or handheld. The first "in" event binds tag ↔ asset and starts the age clock.','Baca aset yang baru di-tag lewat gate atau handheld. Event "in" pertama mengikat tag ↔ aset dan memulai jam usia.')},
        {t:T('Assign custodian + location','Assign custodian + lokasi'),
         d:T('Bulk-assign all, or row-by-row. Confirm — the asset is now live in the register with a full audit trail.','Bulk-assign semua, atau per baris. Konfirmasi — aset sekarang live di register dengan audit trail lengkap.'),
         go:'register', goL:T('Register','Daftar Aset')},
      ],
    },
    {
      tag:'C', tone:'p', t:T('Operate & keep it accurate','Operasikan & jaga akurasi'),
      steps:[
        {t:T('Daily scans update everything','Scan harian update semua'),
         d:T('Gate & handheld reads keep last-seen, location, and custody current — no manual entry.','Pembacaan gate & handheld jaga last-seen, lokasi, dan custody tetap update — tanpa input manual.')},
        {t:T('Cycle count to reconcile','Cycle count untuk rekonsiliasi'),
         d:T('A handheld sweep counts a whole zone in minutes. Variances open an investigation WO.','Sweep handheld hitung satu zona dalam menit. Selisih buka WO investigasi.'),
         go:'audit', goL:T('Stock Audit','Stock Opname')},
      ],
    },
  ];
  return (
    <div className="card card-b" style={{padding:24}}>
      <DocH>{T('Register RFID & Assets','Daftar RFID & Aset')}</DocH>
      <DocLead>
        {T(
          'The exact flow a client follows to get assets into Katalyst — from setting up tag ranges to a fully-registered, RFID-tracked asset. Three phases: set up once, register each asset, then operate.',
          'Alur persis yang diikuti klien untuk memasukkan aset ke Katalyst — dari setup range tag hingga aset ter-registrasi penuh dan terlacak RFID. Tiga fase: setup sekali, daftarkan tiap aset, lalu operasikan.'
        )}
      </DocLead>

      {phases.map((p,pi)=>(
        <div key={pi} style={{marginBottom:20}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
            <div className={`ico ${p.tone}`} style={{width:30, height:30, fontFamily:'JetBrains Mono', fontWeight:700, fontSize:13}}>{p.tag}</div>
            <span style={{fontSize:14.5, fontWeight:650}}>{p.t}</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:`repeat(${p.steps.length}, 1fr)`, gap:0, alignItems:'stretch'}}>
            {p.steps.map((s,si)=>(
              <React.Fragment key={si}>
                <div style={{padding:'2px 14px', position:'relative'}}>
                  <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:6}}>
                    <div style={{width:22, height:22, borderRadius:6, background:'var(--brand)', color:'#fff', display:'grid', placeItems:'center', fontSize:11, fontWeight:700, fontFamily:'Space Grotesk'}}>{si+1}</div>
                    <div style={{fontSize:12.5, fontWeight:600, lineHeight:1.2}}>{s.t}</div>
                  </div>
                  <div style={{fontSize:11, color:'var(--text-2)', lineHeight:1.55}}>{s.d}</div>
                  {s.go && <button className="btn btn-sm" style={{marginTop:8}} onClick={()=>navigate(s.go)}><Icon n="chev" s={10}/>{s.goL}</button>}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}

      <DocCallout tone="s" icon="qr" title={T('How long does tagging take?','Berapa lama proses tagging?')}>
        {T(
          'With a gate or handheld, a trained operator registers 100+ assets per hour. Bulk PO receiving tags an entire delivery in one pass — no typing serial numbers.',
          'Dengan gate atau handheld, operator terlatih mendaftarkan 100+ aset per jam. Penerimaan PO bulk men-tag seluruh kiriman dalam sekali jalan — tanpa mengetik nomor seri.'
        )}
      </DocCallout>

      <div style={{marginTop:14, display:'flex', gap:8}}>
        <button className="btn btn-primary btn-sm" onClick={()=>navigate('scan-in')}><Icon n="arrin" s={11}/>{T('Start registering','Mulai daftar')}</button>
        <button className="btn btn-sm" onClick={()=>navigate('rfid')}><Icon n="qr" s={11}/>{T('Tag print station','Stasiun cetak tag')}</button>
      </div>
    </div>
  );
}

/* === SECTION: Features & Capabilities (parity catalog) === */
function DocsFeatures({T, en, navigate}){
  /* star = Katalyst differentiator beyond typical systems */
  const groups = [
    {t:T('Tagging & Identification','Tagging & Identifikasi'), ic:'qr', tone:'i', items:[
      {l:T('Passive UHF RFID (EPC Gen2)','RFID UHF pasif (EPC Gen2)')},
      {l:T('Barcode / QR fallback','Fallback barcode / QR')},
      {l:T('Bulk tag encode & print (Zebra/SATO)','Encode & cetak tag bulk (Zebra/SATO)')},
      {l:T('Multi-tag per asset (e.g. vehicles)','Multi-tag per aset (mis. kendaraan)'), star:true},
      {l:T('Tag-clone protection via TID','Proteksi clone tag via TID'), star:true},
    ]},
    {t:T('Asset Register & Data','Daftar Aset & Data'), ic:'box', tone:'s', items:[
      {l:T('Unlimited assets + custom fields','Aset tak terbatas + custom field')},
      {l:T('Photos, documents, warranty per asset','Foto, dokumen, garansi per aset')},
      {l:T('Full lifecycle history / audit trail','Riwayat lifecycle penuh / audit trail')},
      {l:T('CSV import & bulk edit','Import CSV & bulk edit')},
    ]},
    {t:T('Daily Operations','Operasi Harian'), ic:'swap', tone:'c', items:[
      {l:T('Scan-In receiving (PO-linked)','Penerimaan Scan-In (terkait PO)')},
      {l:T('Scan-Out disposal w/ approval','Pelepasan Scan-Out dgn approval')},
      {l:T('Check-out / loans + reservations','Check-out / pinjam + reservasi'), star:true},
      {l:T('Transfer w/ custody chain','Transfer dgn rantai custody')},
    ]},
    {t:T('Audit & Tracking','Audit & Pelacakan'), ic:'audit', tone:'w', items:[
      {l:T('RFID cycle count (minutes not weeks)','Cycle count RFID (menit bukan minggu)')},
      {l:T('Variance reconciliation + WO','Rekonsiliasi selisih + WO')},
      {l:T('Real-time location (zone-level RTLS)','Lokasi real-time (RTLS zona)'), star:true},
      {l:T('Dormant-asset detection','Deteksi aset dormant'), star:true},
    ]},
    {t:T('Maintenance (CMMS)','Maintenance (CMMS)'), ic:'wrench', tone:'p', items:[
      {l:T('Work orders (multi-source)','Work order (multi-source)')},
      {l:T('Preventive + predictive scheduling','Jadwal preventive + predictive'), star:true},
      {l:T('Pre-use safety inspections','Inspeksi safety pre-use'), star:true},
      {l:T('Health score, age, last-seen, MTBF','Health score, usia, last-seen, MTBF'), star:true},
    ]},
    {t:T('Finance & Compliance','Finance & Kepatuhan'), ic:'dollar', tone:'i', items:[
      {l:T('Depreciation & NBV (PSAK 16)','Penyusutan & NBV (PSAK 16)')},
      {l:T('GL auto-post (Accurate/SAP/Odoo)','Auto-post GL (Accurate/SAP/Odoo)')},
      {l:T('Audit-grade EPCIS 2.0 event log','Event log EPCIS 2.0 standar audit'), star:true},
      {l:T('Loss prevention + geofencing','Loss prevention + geofencing'), star:true},
    ]},
    {t:T('Platform & Admin','Platform & Admin'), ic:'cog', tone:'c', items:[
      {l:T('Role-based access (8 roles)','Akses berbasis peran (8 peran)')},
      {l:T('SSO (Entra ID) + enforced MFA','SSO (Entra ID) + MFA wajib')},
      {l:T('Full audit log of every action','Audit log penuh tiap aksi')},
      {l:T('Bilingual EN / ID UI','UI bilingual EN / ID'), star:true},
      {l:T('Dark / light themes','Tema gelap / terang')},
    ]},
    {t:T('Reporting & Integrations','Laporan & Integrasi'), ic:'doc', tone:'s', items:[
      {l:T('Pre-built + scheduled reports','Laporan siap-pakai + terjadwal')},
      {l:T('PDF / Excel / CSV / EPCIS export','Export PDF / Excel / CSV / EPCIS')},
      {l:T('Command palette (⌘K) navigation','Navigasi command palette (⌘K)'), star:true},
      {l:T('Notifications: Slack / WA / Email','Notifikasi: Slack / WA / Email')},
    ]},
  ];
  return (
    <div className="card card-b" style={{padding:24}}>
      <DocH>{T('Features & Capabilities','Fitur & Kemampuan')}</DocH>
      <DocLead>
        {T(
          'Everything Katalyst does today, grouped by area. Items marked ',
          'Semua yang Katalyst lakukan hari ini, dikelompokkan per area. Item bertanda '
        )}
        <span style={{display:'inline-flex', alignItems:'center', gap:3, color:'var(--warn)', fontWeight:600}}><Icon n="sparkles" s={11}/>{T('star','bintang')}</span>
        {T(
          ' go beyond what typical RFID asset systems offer.',
          ' melampaui yang ditawarkan sistem aset RFID pada umumnya.'
        )}
      </DocLead>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        {groups.map((g,gi)=>(
          <div key={gi} style={{padding:14, background:'var(--surface-2)', borderRadius:9, border:'1px solid var(--border-soft)'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:9}}>
              <div className={`ico ${g.tone}`} style={{width:28, height:28}}><Icon n={g.ic} s={13}/></div>
              <div style={{fontSize:13, fontWeight:650}}>{g.t}</div>
            </div>
            <div style={{display:'grid', gap:5}}>
              {g.items.map((it,ii)=>(
                <div key={ii} style={{display:'flex', alignItems:'flex-start', gap:7, fontSize:11.5, color:'var(--text-2)'}}>
                  <div style={{width:15, height:15, borderRadius:4, background: it.star?'var(--warn-soft)':'var(--success-soft)', color: it.star?'var(--warn)':'var(--success)', display:'grid', placeItems:'center', flexShrink:0, marginTop:1}}>
                    <Icon n={it.star?'sparkles':'check'} s={9}/>
                  </div>
                  <span>{it.l}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <DocCallout tone="i" icon="check" title={T('So — does it have what most RFID asset systems have?','Jadi — apakah sudah punya yang dimiliki sistem aset RFID kebanyakan?')}>
        {T(
          'Yes — and more. Katalyst covers the full industry-standard set (tagging, register, audit, maintenance, depreciation, RTLS, reporting, RBAC) and adds pre-use safety inspection, predictive maintenance, multi-source work orders, bilingual UI, and an audit-grade EPCIS event log that most systems lack.',
          'Ya — dan lebih. Katalyst mencakup set standar industri lengkap (tagging, register, audit, maintenance, penyusutan, RTLS, laporan, RBAC) dan menambah inspeksi safety pre-use, predictive maintenance, work order multi-source, UI bilingual, dan event log EPCIS standar audit yang tidak dimiliki kebanyakan sistem.'
        )}
      </DocCallout>
    </div>
  );
}

/* === SECTION: Why Katalyst (competitor comparison) === */
function DocsWhy({T, en, navigate}){
  const rows = [
    {f:T('Find any asset instantly','Temukan aset seketika'),         a:T('Manual search','Cari manual'),    b:T('Tag scan','Scan tag'),       c:T('Real-time map + ⌘K','Peta real-time + ⌘K')},
    {f:T('Full stock count','Stock opname penuh'),                     a:T('Days–weeks','Hari–minggu'),       b:T('Hours','Jam'),               c:T('Minutes','Menit')},
    {f:T('Maintenance / work orders','Maintenance / work order'),      a:T('Separate tool','Alat terpisah'),  b:T('Add-on','Add-on'),           c:T('Built-in CMMS','CMMS bawaan')},
    {f:T('Pre-use safety inspection','Inspeksi safety pre-use'),        a:'—',                                  b:'—',                             c:T('Yes + gate lockout','Ya + gate lockout')},
    {f:T('Depreciation & GL posting','Penyusutan & posting GL'),       a:T('Spreadsheet','Spreadsheet'),       b:T('Rarely','Jarang'),           c:T('PSAK 16 + auto-post','PSAK 16 + auto-post')},
    {f:T('Loss prevention / geofence','Loss prevention / geofence'),    a:'—',                                  b:T('Basic','Dasar'),             c:T('CCTV-tagged events','Event ber-tag CCTV')},
    {f:T('Audit-grade event log','Event log standar audit'),           a:'—',                                  b:T('Limited','Terbatas'),        c:T('EPCIS 2.0','EPCIS 2.0')},
    {f:T('Bilingual EN / ID','Bilingual EN / ID'),                     a:'—',                                  b:T('English only','Inggris saja'),c:T('EN + ID','EN + ID')},
    {f:T('Onboarding speed','Kecepatan onboarding'),                   a:T('Weeks','Minggu'),                  b:T('Weeks','Minggu'),            c:T('Guided, days','Terpandu, harian')},
  ];
  return (
    <div className="card card-b" style={{padding:24}}>
      <DocH>{T('Why Katalyst','Kenapa Katalyst')}</DocH>
      <DocLead>
        {T(
          'How Katalyst compares to the two things it usually replaces: spreadsheets / barcode-only tools, and generic off-the-shelf RFID asset trackers.',
          'Bagaimana Katalyst dibanding dua hal yang biasanya digantikan: spreadsheet / alat barcode-saja, dan pelacak aset RFID generik siap-pakai.'
        )}
      </DocLead>

      <div style={{overflow:'hidden', borderRadius:10, border:'1px solid var(--border)'}}>
        <table className="tbl" style={{margin:0}}>
          <thead>
            <tr>
              <th>{T('Capability','Kemampuan')}</th>
              <th>{T('Spreadsheet / Barcode','Spreadsheet / Barcode')}</th>
              <th>{T('Generic RFID','RFID Generik')}</th>
              <th style={{background:'var(--brand-soft)', color:'var(--brand-strong)'}}>Katalyst</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{fontWeight:600, fontSize:12}}>{r.f}</td>
                <td style={{fontSize:11.5, color:'var(--text-3)'}}>{r.a}</td>
                <td style={{fontSize:11.5, color:'var(--text-2)'}}>{r.b}</td>
                <td style={{fontSize:11.5, fontWeight:600, color:'var(--brand-strong)', background:'color-mix(in oklab, var(--brand-soft) 40%, transparent)'}}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:5}}><Icon n="check" s={11}/>{r.c}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:18}}>
        {[
          {ic:'zap',     t:T('One platform','Satu platform'),       d:T('Register, audit, maintain, depreciate, and report — no stitching 4 tools together.','Daftar, audit, maintain, susutkan, dan laporkan — tanpa menyatukan 4 alat.')},
          {ic:'shield',  t:T('Compliance-ready','Siap kepatuhan'),  d:T('PSAK 16, K3/ISO 45001, ISO 17025, audit-grade trails out of the box.','PSAK 16, K3/ISO 45001, ISO 17025, audit trail siap pakai.')},
          {ic:'sparkles',t:T('Built for Indonesia','Dibuat untuk Indonesia'), d:T('Bilingual UI, Rupiah, local ERP & tax (DJP) alignment, local support.','UI bilingual, Rupiah, ERP & pajak lokal (DJP), dukungan lokal.')},
        ].map((x,i)=>(
          <div key={i} style={{padding:13, background:'var(--surface-2)', borderRadius:9, border:'1px solid var(--border-soft)'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
              <div className="ico i" style={{width:26, height:26, borderRadius:6}}><Icon n={x.ic} s={12}/></div>
              <div style={{fontSize:12.5, fontWeight:650}}>{x.t}</div>
            </div>
            <div style={{fontSize:11, color:'var(--text-2)', lineHeight:1.55}}>{x.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* === SECTION: Getting Started === */
function DocsGettingStarted({T, en, navigate}){
  return (
    <div className="card card-b" style={{padding:24}}>
      <DocH>{T('Getting Started','Mulai Cepat')}</DocH>
      <DocLead>
        {T(
          'Katalyst Fixed Assets is an RFID-driven asset tracking platform. Every fixed asset (laptop, forklift, chair, CNC machine, medical device) carries a unique RFID tag. The tag is the "system of record" — every gate scan and handheld read updates location, custody, and condition automatically.',
          'Katalyst Fixed Assets adalah platform pelacakan aset berbasis RFID. Setiap aset tetap (laptop, forklift, kursi, mesin CNC, alat medis) memakai tag RFID unik. Tag ini menjadi "system of record" — setiap scan di gate atau handheld update lokasi, custody, dan kondisi otomatis.'
        )}
      </DocLead>

      <DocH3 n="1">{T('Who uses this platform','Siapa yang pakai platform ini')}</DocH3>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14}}>
        {[
          {ic:'cog',    tone:'i', t:T('Asset Manager','Asset Manager'), d:T('Owns registry · approves disposals · runs reports','Pemilik registry · approve disposal · run report')},
          {ic:'user',   tone:'s', t:T('Custodian','Custodian'),         d:T('Person responsible for an asset · returns it on time','Orang yang bertanggung-jawab atas aset · kembalikan tepat waktu')},
          {ic:'wrench', tone:'w', t:T('Technician','Teknisi'),          d:T('Picks up Work Orders · closes via RFID scan','Ambil Work Order · close lewat scan RFID')},
          {ic:'audit',  tone:'c', t:T('Auditor','Auditor'),             d:T('Runs cycle counts · reconciles variance','Lakukan cycle count · investigasi selisih')},
          {ic:'dollar', tone:'p', t:T('Finance','Finance'),             d:T('Depreciation · NBV · GL posting (PSAK 16)','Penyusutan · NBV · posting GL (PSAK 16)')},
          {ic:'shield', tone:'d', t:T('Security · HSE','Security · K3'),d:T('Loss prevention · pre-use inspections · K3 compliance','Loss prevention · inspeksi pre-use · kepatuhan K3')},
        ].map((r,i)=>(
          <div key={i} style={{padding:11, background:'var(--surface-2)', borderRadius:8, border:'1px solid var(--border-soft)'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:5}}>
              <div className={`ico ${r.tone}`} style={{width:24, height:24, borderRadius:5}}><Icon n={r.ic} s={11}/></div>
              <div style={{fontWeight:600, fontSize:12}}>{r.t}</div>
            </div>
            <div style={{fontSize:11, color:'var(--text-2)', lineHeight:1.5}}>{r.d}</div>
          </div>
        ))}
      </div>

      <DocH3 n="2">{T('First-day checklist','Checklist hari pertama')}</DocH3>
      <DocStep n="1" title={T('Set up master data','Set up master data')}>
        {T(
          'Open Master Data → Locations, Categories, Custodians, Cost Centers, Suppliers. Import from CSV if you have existing data.',
          'Buka Master Data → Lokasi, Kategori, Custodian, Cost Center, Supplier. Import dari CSV kalau ada data existing.'
        )}
        <div><DocPill icon="db" onClick={()=>navigate('masterdata')}>{T('Open Master Data','Buka Master Data')}</DocPill></div>
      </DocStep>
      <DocStep n="2" title={T('Print RFID tags','Cetak tag RFID')}>
        {T(
          'In RFID Tags · Print, allocate an EPC range from your GS1 prefix, then send batches to the Zebra printer.',
          'Di RFID Tags · Cetak, alokasikan range EPC dari prefix GS1 perusahaan, lalu kirim batch ke printer Zebra.'
        )}
        <div><DocPill icon="qr" onClick={()=>navigate('rfid')}>{T('Open RFID Tags','Buka RFID Tags')}</DocPill></div>
      </DocStep>
      <DocStep n="3" title={T('Scan-In your first batch','Scan-In batch pertama')}>
        {T(
          'In Scan-In · Receiving, link to a PO, scan all tags via the gate or handheld, then assign location + custodian. Bulk OK.',
          'Di Scan-In · Penerimaan, link ke PO, scan semua tag lewat gate atau handheld, lalu assign lokasi + custodian. Bulk boleh.'
        )}
        <div><DocPill icon="arrin" onClick={()=>navigate('scan-in')}>{T('Open Scan-In','Buka Scan-In')}</DocPill></div>
      </DocStep>
      <DocStep n="4" title={T('Watch the Dashboard','Pantau Dashboard')}>
        {T(
          'Dashboard shows live RFID activity, fleet health, maintenance alerts, and depreciation. Everything else hangs off this view.',
          'Dashboard tampilkan aktivitas RFID live, health fleet, alert maintenance, dan penyusutan. Semua modul lain bercabang dari sini.'
        )}
        <div><DocPill icon="dash" onClick={()=>navigate('dashboard')}>{T('Open Dashboard','Buka Dashboard')}</DocPill></div>
      </DocStep>

      <DocCallout tone="i" icon="sparkles" title={T('Pro tip · the keyboard','Tips · keyboard')}>
        {T(
          'Press ⌘K (or Ctrl+K) anywhere to jump to any module, asset, or action. Use the top-right EN/ID button to switch language.',
          'Tekan ⌘K (atau Ctrl+K) di mana saja untuk jump ke modul / aset / aksi. Gunakan tombol EN/ID di kanan atas untuk ganti bahasa.'
        )}
      </DocCallout>
    </div>
  );
}

/* === SECTION: End-to-End Flow === */
function DocsFlow({T, en, navigate}){
  const stages = [
    {ic:'arrin',  tone:'s', t:T('1 · SCAN-IN','1 · SCAN-IN'),     d:T('Receiving','Penerimaan'), page:'scan-in',
      bullets:[
        T('RFID tag printed & encoded with EPC','Tag RFID di-print + encode EPC'),
        T('Asset registered + custodian assigned','Aset di-register + custodian di-assign'),
        T('First "in" event = age clock starts','Event "in" pertama = jam usia mulai'),
      ]},
    {ic:'radar',  tone:'i', t:T('2 · OPERATE','2 · OPERATE'),     d:T('Daily use','Pemakaian harian'), page:'rtls',
      bullets:[
        T('Gate antennas log every pass','Antena gate catat setiap lewat'),
        T('Pre-use QC scan before checkout','Scan QC pre-use sebelum checkout'),
        T('Cycles + run-hours tick up','Cycles + jam operasi naik otomatis'),
      ]},
    {ic:'wrench', tone:'w', t:T('3 · MAINTAIN','3 · MAINTAIN'),    d:T('Health & PM','Kesehatan & PM'), page:'maintenance',
      bullets:[
        T('Track age, last-seen, days w/o service','Track usia, last-seen, hari tanpa service'),
        T('PM rule → auto-generate Work Order','PM rules auto-create Work Orders'),
        T('Tech scan at site auto-closes WO','Tech scan di lokasi auto-close WO'),
      ]},
    {ic:'swap',   tone:'p', t:T('4 · TRANSFER / DISPOSE','4 · TRANSFER / DISPOSE'), d:T('Move or retire','Pindah atau pensiun'), page:'transfer',
      bullets:[
        T('Custody updates on gate scan','Custody update saat scan di gate'),
        T('Disposal WO + scan-out final','WO disposal + scan-out final'),
        T('Tag deactivated, GL entry posted','Tag deactivated, jurnal GL diposting'),
      ]},
  ];
  return (
    <div className="card card-b" style={{padding:24}}>
      <DocH>{T('End-to-End Lifecycle','Alur End-to-End')}</DocH>
      <DocLead>
        {T(
          'Every asset moves through 4 stages. RFID is the "system of record" — each scan updates last-seen, run-hours, and custody. When any signal needs human action (PM due, inspection fail, transfer approved), the system automatically creates a Work Order.',
          'Setiap aset melalui 4 tahap. RFID adalah "system of record" — setiap scan update last-seen, run-hours, dan custody. Saat ada sinyal yang butuh tindakan (PM jatuh tempo, inspeksi gagal, transfer di-approve), sistem otomatis buat Work Order.'
        )}
      </DocLead>

      {/* Lifecycle row */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 16px 1fr 16px 1fr 16px 1fr', alignItems:'stretch', marginBottom:8}}>
        {stages.map((s,i)=>(
          <React.Fragment key={i}>
            <button onClick={()=>navigate(s.page)}
              style={{padding:13, background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, textAlign:'left', cursor:'pointer', transition:'all .14s'}}
              onMouseEnter={(e)=>e.currentTarget.style.borderColor='color-mix(in oklab, var(--brand) 30%, var(--border))'}
              onMouseLeave={(e)=>e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{display:'flex', alignItems:'center', gap:9, marginBottom:9}}>
                <div className={`ico ${s.tone}`} style={{width:32, height:32}}><Icon n={s.ic} s={14}/></div>
                <div>
                  <div style={{fontSize:9.5, color:'var(--text-3)', fontWeight:600, letterSpacing:'.06em'}}>{s.t}</div>
                  <div style={{fontSize:13, fontWeight:650, marginTop:1}}>{s.d}</div>
                </div>
              </div>
              {s.bullets.map((b,j)=>(
                <div key={j} style={{fontSize:10.5, color:'var(--text-2)', display:'flex', gap:6, marginTop:4, lineHeight:1.4}}>
                  <span style={{color:'var(--brand-strong)', flexShrink:0}}>›</span><span>{b}</span>
                </div>
              ))}
              <div style={{fontSize:10, color:'var(--brand-strong)', fontWeight:600, marginTop:9, display:'flex', alignItems:'center', gap:3}}>
                {T('Open module','Buka modul')} <Icon n="chev" s={9}/>
              </div>
            </button>
            {i < stages.length-1 && (<div style={{display:'grid', placeItems:'center'}}><Icon n="chev" s={18} c="var(--text-4)"/></div>)}
          </React.Fragment>
        ))}
      </div>

      {/* Down arrow */}
      <div style={{height:30, position:'relative', textAlign:'center', color:'var(--text-3)', fontSize:10.5, fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase'}}>
        ↓ {T('All signals create Work Orders','Semua sinyal bikin Work Order')} ↓
      </div>

      {/* WO bar */}
      <div onClick={()=>navigate('maintenance')} style={{
        padding:'14px 16px', cursor:'pointer',
        background:'linear-gradient(90deg, var(--brand-soft) 0%, color-mix(in oklab, var(--brand-soft) 50%, var(--surface-2)) 100%)',
        border:'1px solid color-mix(in oklab, var(--brand) 32%, var(--border))',
        borderRadius:8, display:'flex', alignItems:'center', gap:14
      }}>
        <div className="ico i" style={{width:40, height:40}}><Icon n="wrench" s={18}/></div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:650, color:'var(--brand-strong)'}}>{T('WORK ORDER · execution layer','WORK ORDER · execution layer')}</div>
          <div style={{fontSize:11.5, color:'var(--text-2)', marginTop:2, lineHeight:1.5}}>
            {T(
              'A Work Order is any job that needs a human to do something. Source can be Maintenance, Inspection, Transfer, Disposal, or Audit.',
              'Work Order adalah pekerjaan apa pun yang butuh manusia kerjakan. Source bisa dari Maintenance, Inspection, Transfer, Disposal, atau Audit.'
            )}
          </div>
        </div>
        <Icon n="chev" s={14} c="var(--brand-strong)"/>
      </div>

      <DocH3 n="A">{T('How RFID powers all of this','Bagaimana RFID jadi tulang punggung')}</DocH3>
      <DocP>
        {T(
          'Each asset wears a passive UHF RFID tag (EPC Gen2). The tag has no battery and lasts 10+ years. Fixed antennas at every gate, lab door, and dock door read tags as they pass. Handheld readers do the same for cycle counts and field service.',
          'Setiap aset memakai tag RFID UHF pasif (EPC Gen2). Tag tidak pakai baterai, tahan 10+ tahun. Antena fixed di gate, pintu lab, dan dock door baca tag saat lewat. Handheld reader lakukan hal yang sama untuk cycle count dan field service.'
        )}
      </DocP>
      <DocP>
        {T(
          'Every read is an event: { EPC, location, time, antenna, reader user }. Events stream to the EPCIS 2.0 event log. From there, modules derive: last-seen, location history, dwell time, run-hours, custody chain, and audit trails.',
          'Setiap pembacaan adalah event: { EPC, lokasi, waktu, antena, user reader }. Event mengalir ke EPCIS 2.0 event log. Dari sana, modul men-derive: last-seen, riwayat lokasi, dwell time, run-hours, rantai custody, dan audit trail.'
        )}
      </DocP>

      <DocCallout tone="i" icon="radar" title={T('Why this matters','Kenapa ini penting')}>
        {T(
          'You stop chasing assets manually. The platform knows where everything is, who has it, how long it has been there, and when it needs service — in real time.',
          'Anda berhenti kejar-kejaran aset manual. Platform tahu setiap aset di mana, siapa yang pegang, sudah berapa lama, dan kapan butuh service — secara real-time.'
        )}
      </DocCallout>
    </div>
  );
}

/* === SECTION: Core Concepts === */
function DocsConcepts({T, en, navigate}){
  const concepts = [
    {
      id:'rfid', icon:'qr', tone:'i',
      t:T('RFID Tag & EPC','Tag RFID & EPC'),
      d:T(
        'Each tag has a 96-bit Electronic Product Code (EPC) — globally unique. Format: E280-1170-XXXX-XXXX-XXXX. The EPC is bound to the asset in our database. Tag types: hard tag (metal/heat-resistant for machinery), label tag (paper, for IT/furniture), embedded (vehicle, RFID windshield).',
        'Setiap tag punya Electronic Product Code (EPC) 96-bit — unik global. Format: E280-1170-XXXX-XXXX-XXXX. EPC di-bind ke aset di database kita. Jenis tag: hard tag (logam/tahan panas untuk mesin), label tag (kertas, untuk IT/furniture), embedded (kendaraan, RFID windshield).'
      ),
    },
    {
      id:'wo', icon:'wrench', tone:'w',
      t:T('Work Order (WO)','Work Order (WO)'),
      d:T(
        'A WO is a job ticket — any task that needs a human to execute. WOs are NOT only for maintenance. Each WO carries a source: 🔧 PM scheduled, 🤖 AI predictive, 🔨 Corrective, 🛡️ Inspection FAIL, 🔄 Transfer, ♻️ Disposal, 🔍 Audit variance. Tech picks it up, does the work, scans the asset at site → WO auto-closes.',
        'WO adalah tiket pekerjaan — tugas apa pun yang butuh manusia kerjakan. WO BUKAN hanya untuk maintenance. Setiap WO bawa source: 🔧 PM terjadwal, 🤖 AI predictive, 🔨 Corrective, 🛡️ Inspeksi GAGAL, 🔄 Transfer, ♻️ Disposal, 🔍 Audit variance. Tech ambil, kerjakan, scan aset di lokasi → WO auto-close.'
      ),
    },
    {
      id:'health', icon:'sparkles', tone:'s',
      t:T('Health Score','Health Score'),
      d:T(
        '0–100 composite of: age, days since last maintenance, MTBF, run-hours, and sensor signals (vibration, temperature). Buckets: Healthy 80+, Watch 60–79, Alert 40–59, Critical < 40. Drives priority when scheduling PM.',
        '0–100 gabungan dari: usia, hari sejak service terakhir, MTBF, jam operasi, dan sinyal sensor (getaran, suhu). Bucket: Sehat 80+, Watch 60–79, Alert 40–59, Kritikal < 40. Jadi acuan prioritas saat jadwalkan PM.'
      ),
    },
    {
      id:'preuse', icon:'shield', tone:'d',
      t:T('Pre-Use Inspection','Inspeksi Pre-Use'),
      d:T(
        'Mandatory checks before using safety-critical items (vehicle tires, ladders, harnesses, fire extinguishers, first-aid kits). Per K3 / ISO 45001. Checkout via RFID gate is BLOCKED if inspection is overdue or failed.',
        'Cek wajib sebelum pakai item safety-critical (ban kendaraan, tangga, harness, APAR, P3K). Sesuai K3 / ISO 45001. Checkout via gate RFID akan di-BLOCK kalau inspeksi overdue atau gagal.'
      ),
    },
    {
      id:'custodian', icon:'user', tone:'p',
      t:T('Custodian','Custodian'),
      d:T(
        'The person currently responsible for an asset. Updated automatically when an RFID gate scan detects the asset following someone (gate scan + badge tap pairing), or manually in Transfer. Used for return-on-time SLAs and audit chain.',
        'Orang yang saat ini bertanggung jawab atas aset. Update otomatis saat scan gate RFID deteksi aset mengikuti seseorang (scan gate + tap badge), atau manual di Mutasi. Dipakai untuk SLA pengembalian dan rantai audit.'
      ),
    },
    {
      id:'depr', icon:'dollar', tone:'c',
      t:T('Depreciation (PSAK 16)','Penyusutan (PSAK 16)'),
      d:T(
        'Straight-line by default, configurable per asset class. NBV (Net Book Value) auto-recalculates monthly. Auto-post to Accurate / SAP / Odoo journal. Disposal triggers loss/gain entry.',
        'Default straight-line, dapat diatur per kelas aset. NBV (Net Book Value) auto-recalc bulanan. Auto-post ke jurnal Accurate / SAP / Odoo. Disposal trigger entry loss/gain.'
      ),
    },
  ];
  return (
    <div className="card card-b" style={{padding:24}}>
      <DocH>{T('Core Concepts','Konsep Inti')}</DocH>
      <DocLead>
        {T(
          'Six ideas to understand before you start. Each one shows up across the platform.',
          'Enam konsep untuk dipahami sebelum mulai. Semua muncul di seluruh platform.'
        )}
      </DocLead>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        {concepts.map(c=>(
          <div key={c.id} style={{padding:14, background:'var(--surface-2)', borderRadius:9, border:'1px solid var(--border-soft)'}}>
            <div style={{display:'flex', alignItems:'center', gap:9, marginBottom:8}}>
              <div className={`ico ${c.tone}`} style={{width:32, height:32}}><Icon n={c.icon} s={14}/></div>
              <div style={{fontSize:13, fontWeight:650}}>{c.t}</div>
            </div>
            <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.6}}>{c.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* === SECTION: Module guides === */
function DocsModule({T, en, navigate, m}){
  const guides = {
    register: {
      t:T('Asset Register','Daftar Aset'), ic:'box',
      lead:T(
        'The master list of every fixed asset in your organization. Filter, search, export, drill into detail.',
        'Daftar master semua aset tetap di organisasi. Filter, cari, export, masuk ke detail.'
      ),
      steps:[
        {t:T('Open Asset Register from the sidebar','Buka Daftar Aset dari sidebar'),
         d:T('Sidebar → Assets → Asset Register. List shows all assets with status (Deployed / Checked Out / Maintenance / Idle / Retired).',
             'Sidebar → Aset → Daftar Aset. List tampilkan semua aset dengan status (Deployed / Checked Out / Maintenance / Idle / Retired).')},
        {t:T('Filter by category, location, status','Filter berdasarkan kategori, lokasi, status'),
         d:T('Use top chips: IT, Tools, Furniture, Vehicles, Lab, Medical, Machinery. Use search bar for name / ID / EPC / serial.',
             'Pakai chips atas: IT, Tools, Furniture, Vehicles, Lab, Medical, Machinery. Pakai search untuk nama / ID / EPC / serial.')},
        {t:T('Click any row to open Asset Detail','Klik baris untuk buka Detail Aset'),
         d:T('Detail shows full history: scans, transfers, maintenance, depreciation, documents, photos.',
             'Detail tampilkan riwayat penuh: scan, mutasi, maintenance, penyusutan, dokumen, foto.')},
        {t:T('Bulk-export to PDF / Excel / CSV','Bulk export ke PDF / Excel / CSV'),
         d:T('Use Reports → Asset by Custodian for serah-terima, or filter list + Export button for ad-hoc.',
             'Pakai Laporan → Aset per Custodian untuk serah-terima, atau filter list + tombol Export untuk ad-hoc.')},
      ],
      page:'register',
    },
    in: {
      t:T('Scan-In · Receiving','Scan-In · Penerimaan'), ic:'arrin',
      lead:T(
        'Bring new assets into the system. Link to a PO, encode RFID tags, assign location + custodian.',
        'Masukkan aset baru ke sistem. Link ke PO, encode tag RFID, assign lokasi + custodian.'
      ),
      steps:[
        {t:T('Pick a PO or "Walk-in" entry','Pilih PO atau "Walk-in"'),
         d:T('Open Scan-In → choose the open PO matching your delivery. The system pre-fills line items, quantity, supplier.',
             'Buka Scan-In → pilih PO terbuka yang cocok dengan pengiriman. Sistem auto-isi line item, qty, supplier.')},
        {t:T('Scan all tags via gate or handheld','Scan semua tag lewat gate atau handheld'),
         d:T('Walk the delivery through the receiving gate, OR sweep with handheld. The counter ticks up as each EPC is read.',
             'Bawa kiriman lewat gate penerimaan, ATAU sweep dengan handheld. Counter naik tiap EPC terbaca.')},
        {t:T('Assign location + custodian','Assign lokasi + custodian'),
         d:T('Bulk-assign all to one location/custodian, or row-by-row. Each row gets a green check when ready.',
             'Bulk-assign semua ke satu lokasi/custodian, atau per baris. Tiap baris dapat centang hijau saat siap.')},
        {t:T('Confirm — first "in" event is logged','Konfirmasi — event "in" pertama dicatat'),
         d:T('This first scan starts the asset age clock and creates the GL acquisition entry. Asset is now registered.',
             'Scan pertama ini mulai jam usia aset dan buat entry akuisisi GL. Aset sekarang ter-register.')},
      ],
      callout:{tone:'i', icon:'sparkles', title:T('Bulk receiving','Penerimaan bulk'),
        text:T('You can scan 100+ items in under 1 minute. Make sure tags aren\'t blocked by metal stacking.',
               'Bisa scan 100+ item dalam < 1 menit. Pastikan tag tidak ter-block oleh tumpukan logam.')},
      page:'scan-in',
    },
    out: {
      t:T('Scan-Out · Disposal','Scan-Out · Pelepasan'), ic:'arrout',
      lead:T(
        'Permanently retire an asset. Either disposal (scrap / sold / e-waste) or return-to-vendor.',
        'Pensiunkan aset secara permanen. Bisa disposal (scrap / dijual / e-waste) atau return-to-vendor.'
      ),
      steps:[
        {t:T('Pick the assets to retire','Pilih aset yang dipensiunkan'),
         d:T('Filter Asset Register, multi-select, click "Scan-Out", or scan via mobile/handheld at the e-waste dock.',
             'Filter Daftar Aset, multi-select, klik "Scan-Out", atau scan via mobile/handheld di dock e-waste.')},
        {t:T('Choose disposal type + reason','Pilih jenis disposal + alasan'),
         d:T('Sold / Scrapped / Lost / Damaged / Donated / Returned. Each needs supporting docs (sale invoice, scrap photo, etc.).',
             'Sold / Scrapped / Lost / Damaged / Donated / Returned. Tiap pilihan butuh dokumen pendukung (faktur, foto scrap, dll).')},
        {t:T('Approval (Finance + Manager)','Persetujuan (Finance + Manager)'),
         d:T('Anything above the threshold (default Rp 5 jt) needs dual approval. Threshold configurable in Settings.',
             'Apapun di atas threshold (default Rp 5 jt) butuh dual approval. Threshold dapat diatur di Settings.')},
        {t:T('Final scan-out + tag deactivation','Scan-out final + tag deaktivasi'),
         d:T('Asset crosses the disposal gate, tag is killed (TID + kill password), GL entry posts loss/gain to ledger.',
             'Aset melewati gate disposal, tag di-kill (TID + kill password), entry GL post loss/gain ke buku besar.')},
      ],
      page:'scan-out',
    },
    checkout: {
      t:T('Check-Out · Loans','Check-Out · Peminjaman'), ic:'swap',
      lead:T(
        'Lend and reserve shared tools, equipment, and loaner devices. RFID gate scans check items out and back in with due dates and overdue alerts.',
        'Pinjamkan dan reservasi alat, peralatan, dan device loaner bersama. Scan gate RFID check-out dan check-in dengan jatuh tempo dan alert overdue.'
      ),
      steps:[
        {t:T('Scan to check out','Scan untuk pinjam'),
         d:T('Borrower scans the asset tag + their badge at the crib gate. A loan record opens automatically with borrower, department, and time.',
             'Peminjam scan tag aset + badge di gate crib. Record pinjaman otomatis terbuka dengan peminjam, departemen, dan waktu.')},
        {t:T('Set a due date','Set jatuh tempo'),
         d:T('Default per category (tools 7d, IT loaner 30d). The system sends reminders before due and escalates overdue items.',
             'Default per kategori (alat 7h, IT loaner 30h). Sistem kirim pengingat sebelum jatuh tempo dan eskalasi item overdue.')},
        {t:T('Reserve ahead of time','Reservasi di awal'),
         d:T('Book a shared asset for a future date/time to prevent double-booking. Reservation converts to a loan on pickup scan.',
             'Booking aset bersama untuk tanggal/jam mendatang agar tidak double-booking. Reservasi jadi pinjaman saat scan pickup.')},
        {t:T('Return scan + condition log','Scan kembali + log kondisi'),
         d:T('Returning the asset past the gate auto-closes the loan, logs condition, and flags items needing inspection before re-loan.',
             'Mengembalikan aset lewat gate auto-close pinjaman, log kondisi, dan tandai item yang perlu inspeksi sebelum dipinjam lagi.')},
      ],
      callout:{tone:'i', icon:'sparkles', title:T('Connected modules','Modul terhubung'),
        text:T('Scan-Out fires the loan event · Maintenance flags items needing inspection · Loss Prevention alerts if an asset leaves without a checkout.',
               'Scan-Out memicu event pinjam · Maintenance tandai item yang perlu inspeksi · Loss Prevention alert jika aset keluar tanpa checkout.')},
      page:'checkout',
    },
    transfer: {
      t:T('Transfer','Mutasi Aset'), ic:'swap',
      lead:T(
        'Move assets between locations or change custodian. RFID gate scans confirm arrival.',
        'Pindahkan aset antar lokasi atau ganti custodian. Scan gate RFID konfirmasi tiba di tujuan.'
      ),
      steps:[
        {t:T('Create a Transfer request','Buat request Mutasi'),
         d:T('Pick source + destination location, list of asset IDs (or scan them via handheld), reason, and ETA.',
             'Pilih lokasi asal + tujuan, daftar ID aset (atau scan via handheld), alasan, dan ETA.')},
        {t:T('Approval if cross-cost-center','Approval kalau cross cost-center'),
         d:T('Internal moves within the same cost center are auto-approved. Cross-CC requires PIC + Finance sign-off.',
             'Pindahan internal dalam cost center yang sama auto-approve. Cross-CC butuh persetujuan PIC + Finance.')},
        {t:T('Auto-WO for the move crew','Auto-WO untuk crew angkat')},
        {t:T('Asset crosses destination gate → custody updated','Aset lewat gate tujuan → custody update'),
         d:T('Last-seen, location, custodian all update automatically. WO auto-closes. Transfer marked complete.',
             'Last-seen, lokasi, custodian semua update otomatis. WO auto-close. Mutasi tandai selesai.')},
      ],
      page:'transfer',
    },
    audit: {
      t:T('Stock Audit · Cycle Count','Stock Opname'), ic:'audit',
      lead:T(
        'Periodic check that physical assets match the book. RFID makes a full count take minutes not weeks.',
        'Cek berkala bahwa aset fisik sesuai dengan buku. RFID bikin full count selesai dalam menit, bukan minggu.'
      ),
      steps:[
        {t:T('Plan the audit','Rencanakan audit'),
         d:T('Pick scope (location / category / cost center) and target date. ABC method optional (count A monthly, B quarterly, C annually).',
             'Pilih scope (lokasi / kategori / cost center) dan tanggal target. Metode ABC opsional (A bulanan, B kuartalan, C tahunan).')},
        {t:T('Sweep the zone with handheld','Sweep zona dengan handheld'),
         d:T('Walk the zone, sweep handheld in arcs. Tags read = "found". The app shows live coverage (e.g. 184 / 200).',
             'Jalan ke zona, sweep handheld memutar. Tag terbaca = "ditemukan". Aplikasi tampilkan coverage live (mis. 184 / 200).')},
        {t:T('Reconcile variance','Investigasi selisih'),
         d:T('Missing? Open Audit Variance WO. Surplus? Mark as found-elsewhere or check if registry is stale.',
             'Hilang? Buka WO Audit Variance. Surplus? Tandai found-elsewhere atau cek apakah registry usang.')},
        {t:T('Post audit journal','Post jurnal audit'),
         d:T('After review, write-off losses and recognize found assets. Audit trail immutable in EPCIS log.',
             'Setelah review, write-off losses dan recognize found assets. Audit trail immutable di EPCIS log.')},
      ],
      page:'audit',
    },
    maint: {
      t:T('Maintenance · CMMS','Maintenance · CMMS'), ic:'wrench',
      lead:T(
        'Track asset health, run Work Orders, schedule preventive maintenance, and enforce pre-use safety inspections.',
        'Track kesehatan aset, jalankan Work Order, jadwalkan preventive maintenance, dan terapkan inspeksi safety pre-use.'
      ),
      steps:[
        {t:T('Asset Health · Age tab','Tab Asset Health · Usia'),
         d:T('See every asset with age, last-seen, days w/o maintenance, MTBF, health score. Filter by dormant / overdue / critical.',
             'Lihat tiap aset dengan usia, last-seen, hari tanpa maintenance, MTBF, health score. Filter berdasarkan dormant / overdue / critical.')},
        {t:T('Work Orders · with source','Work Orders · dengan source'),
         d:T('Each WO carries a source badge: PM / Predictive / Corrective / Inspection / Transfer / Disposal / Audit. Filter by source.',
             'Tiap WO punya badge source: PM / Predictive / Corrective / Inspection / Transfer / Disposal / Audit. Filter berdasarkan source.')},
        {t:T('Pre-Use Inspection (safety-critical)','Pre-Use Inspection (safety-critical)'),
         d:T('Vehicles (tires/ban), ladders, harnesses, APAR, P3K. RFID checkout BLOCKED if overdue or failed.',
             'Kendaraan (ban), tangga, harness, APAR, P3K. Checkout RFID DI-BLOCK kalau overdue atau gagal.')},
        {t:T('PM Schedule + Reminder Rules','Jadwal PM + Reminder Rules'),
         d:T('Rules auto-generate WOs by time (90/180/365d), by cycles, or by run-hours. Edit rules in Settings.',
             'Rules auto-bikin WO berdasarkan waktu (90/180/365d), cycles, atau jam operasi. Edit rules di Settings.')},
      ],
      page:'maintenance',
    },
    rtls: {
      t:T('Real-Time Location (RTLS)','Lokasi Real-Time (RTLS)'), ic:'pin',
      lead:T(
        'See where every asset is right now on a live floor map. Useful for high-value items and emergency response.',
        'Lihat di mana setiap aset sekarang juga di peta lantai live. Berguna untuk item bernilai tinggi dan respons darurat.'
      ),
      steps:[
        {t:T('Pick a site + floor','Pilih site + lantai')},
        {t:T('Watch the live heatmap','Pantau heatmap live'),
         d:T('Each dot = one asset. Hover for ID + custodian. Color = category. Refreshes every 5 seconds from gate scans.',
             'Tiap titik = satu aset. Hover untuk ID + custodian. Warna = kategori. Refresh tiap 5 detik dari scan gate.')},
        {t:T('Search a specific asset','Cari aset tertentu'),
         d:T('Type ID or EPC. The asset pulses on the map. Last-seen + dwell time shown in side panel.',
             'Ketik ID atau EPC. Aset pulsate di peta. Last-seen + dwell time tampil di side panel.')},
      ],
      page:'rtls',
    },
    security: {
      t:T('Loss Prevention','Loss Prevention'), ic:'shield',
      lead:T(
        'Detect theft, unauthorized exits, and after-hours movement. CCTV auto-tags suspect events.',
        'Deteksi pencurian, exit tanpa izin, dan pergerakan di luar jam. CCTV auto-tag event mencurigakan.'
      ),
      steps:[
        {t:T('Set geofences in Settings → RFID','Set geofence di Settings → RFID'),
         d:T('Define perimeters (e.g. parking lot, building exit). Crossing them without authorization triggers alarm.',
             'Definisikan perimeter (mis. parkir, exit gedung). Lintasi tanpa otorisasi → trigger alarm.')},
        {t:T('Review incidents','Review insiden'),
         d:T('Each incident shows: asset, time, gate, CCTV snippet, last-known custodian. Triage as theft / mistake / authorized.',
             'Tiap insiden tampilkan: aset, waktu, gate, cuplikan CCTV, custodian terakhir. Triage sebagai pencurian / mistake / authorized.')},
        {t:T('Recover or write off','Recovery atau write-off'),
         d:T('If recovered, return-to-stock. If lost, file insurance claim. All steps tracked.',
             'Kalau ketemu, return-to-stock. Kalau hilang, ajukan klaim asuransi. Semua step di-track.')},
      ],
      page:'security',
    },
    users: {
      t:T('User Management','Manajemen User'), ic:'users',
      lead:T(
        'Manage who can access what. Role-based permissions, SSO, enforced MFA, and a full audit log of every action.',
        'Kelola siapa bisa akses apa. Perizinan berbasis peran, SSO, MFA wajib, dan audit log penuh tiap aksi.'
      ),
      steps:[
        {t:T('Invite a user','Undang user'),
         d:T('Send an email invite with a 7-day activation link. Pre-set their role, department, and default location.',
             'Kirim undangan email dengan link aktivasi 7 hari. Set awal peran, departemen, dan lokasi default.')},
        {t:T('Assign a role','Tetapkan peran'),
         d:T('8 built-in roles: Admin, Asset Manager, Custodian, Auditor, Maintenance, Finance, IT Support, Read-Only. Each maps to module permissions.',
             '8 peran bawaan: Admin, Asset Manager, Custodian, Auditor, Maintenance, Finance, IT Support, Read-Only. Tiap peran dipetakan ke izin modul.')},
        {t:T('Enforce security','Terapkan keamanan'),
         d:T('Require MFA per role, SSO via Microsoft Entra ID, auto-lockout after failed logins, and session timeouts.',
             'Wajibkan MFA per peran, SSO via Microsoft Entra ID, auto-lockout setelah login gagal, dan timeout sesi.')},
        {t:T('Review the audit log','Tinjau audit log'),
         d:T('Every action is logged with user, resource, IP, and time. Filter for failed logins and permission changes.',
             'Tiap aksi tercatat dengan user, resource, IP, dan waktu. Filter untuk login gagal dan perubahan izin.')},
      ],
      callout:{tone:'i', icon:'shield', title:T('Least-privilege by default','Hak minimum secara default'),
        text:T('Custodians see only their own assets; Auditors are read-only; only Admins reach Settings. Scope can be narrowed per location or cost center.',
               'Custodian hanya lihat aset miliknya; Auditor read-only; hanya Admin yang bisa Settings. Scope bisa dipersempit per lokasi atau cost center.')},
      page:'users',
    },
    reports: {
      t:T('Reports','Laporan'), ic:'doc',
      lead:T(
        'Pre-built reports for Finance, Audit, and Operations. All exportable to PDF / Excel / CSV / EPCIS JSON-LD.',
        'Laporan siap-pakai untuk Finance, Audit, dan Operasi. Semua bisa di-export ke PDF / Excel / CSV / EPCIS JSON-LD.'
      ),
      steps:[
        {t:T('Pick a report from the catalog','Pilih laporan dari katalog'),
         d:T('Depreciation Schedule (PSAK 16), Asset by Custodian, Cost Center Allocation, Maintenance Cost, EPCIS Export, Loss & Recovery.',
             'Jadwal Penyusutan (PSAK 16), Aset per Custodian, Alokasi Cost Center, Biaya Maintenance, Export EPCIS, Laporan Kehilangan.')},
        {t:T('Set parameters','Set parameter'),
         d:T('Period, location, category, cost center, format. Save the combination as a "favorite" for one-click re-runs.',
             'Periode, lokasi, kategori, cost center, format. Simpan kombinasi sebagai "favorite" untuk re-run sekali klik.')},
        {t:T('Schedule recurring exports','Jadwalkan export berulang'),
         d:T('Email/Drive delivery monthly. Common: depreciation to Finance day-1 of month, custodian list to Ops weekly.',
             'Kirim email/Drive bulanan. Umum: penyusutan ke Finance tgl-1 bulan, daftar custodian ke Ops mingguan.')},
      ],
      page:'reports',
    },
  };
  const g = guides[m];
  if (!g) return null;
  return (
    <div className="card card-b" style={{padding:24}}>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:10}}>
        <div className="ico i" style={{width:38, height:38}}><Icon n={g.ic} s={16}/></div>
        <DocH>{g.t}</DocH>
      </div>
      <DocLead>{g.lead}</DocLead>

      <DocH3 n="•">{T('How to use it','Cara pakai')}</DocH3>
      {g.steps.map((s,i)=>(
        <DocStep key={i} n={i+1} title={s.t}>{s.d}</DocStep>
      ))}

      {g.callout && <DocCallout tone={g.callout.tone} icon={g.callout.icon} title={g.callout.title}>{g.callout.text}</DocCallout>}

      <div style={{marginTop:14, paddingTop:14, borderTop:'1px solid var(--border-soft)', display:'flex', alignItems:'center', gap:10}}>
        <span style={{fontSize:11.5, color:'var(--text-3)'}}>{T('Ready to try it?','Siap coba?')}</span>
        <button className="btn btn-primary btn-sm" onClick={()=>navigate(g.page)}><Icon n="chev" s={11}/>{T('Open ','Buka ')}{g.t}</button>
      </div>
    </div>
  );
}

/* === SECTION: Roadmap / Rollout === */
function DocsRoadmap({T, en, navigate}){
  const live = [
    {ic:'box',    l:T('Asset Register & Master Data','Daftar Aset & Master Data')},
    {ic:'qr',     l:T('RFID tag print & encode','Cetak & encode tag RFID')},
    {ic:'arrin',  l:T('Scan-In / Scan-Out / Transfer','Scan-In / Scan-Out / Mutasi')},
    {ic:'swap',   l:T('Check-Out & Loans','Check-Out & Peminjaman')},
    {ic:'audit',  l:T('Stock Audit / Cycle Count','Stock Opname / Cycle Count')},
    {ic:'wrench', l:T('Maintenance & Work Orders','Maintenance & Work Order')},
    {ic:'pin',    l:T('Real-Time Location (RTLS)','Lokasi Real-Time (RTLS)')},
    {ic:'shield', l:T('Loss Prevention','Loss Prevention')},
    {ic:'doc',    l:T('Reports & Exports','Laporan & Export')},
  ];
  const phases = [
    {
      tag:'Phase 1', tone:'i', when:T('Next 1–2 months','1–2 bulan ke depan'),
      title:T('Finance & compliance depth','Kedalaman finance & kepatuhan'),
      items:[
        {ic:'dollar', t:T('Depreciation & NBV engine','Engine penyusutan & NBV'),
         d:T('Dedicated finance module: straight-line / declining-balance, monthly NBV, auto-post to Accurate / SAP / Odoo. PSAK 16 compliant.',
             'Modul finance khusus: straight-line / saldo-menurun, NBV bulanan, auto-post ke Accurate / SAP / Odoo. Patuh PSAK 16.')},
        {ic:'shield', t:T('Warranty & insurance tracking','Tracking garansi & asuransi'),
         d:T('Expiry reminders, claim workflow, policy documents per asset. Auto-flag assets out of warranty before a repair WO.',
             'Pengingat kedaluwarsa, alur klaim, dokumen polis per aset. Auto-flag aset di luar garansi sebelum WO perbaikan.')},
        {ic:'doc',    t:T('Contracts / AMC / lease register','Register kontrak / AMC / sewa'),
         d:T('Track service contracts, annual maintenance contracts, and leased assets with renewal alerts.',
             'Lacak kontrak servis, kontrak pemeliharaan tahunan, dan aset sewa dengan alert perpanjangan.')},
      ],
    },
    {
      tag:'Phase 2', tone:'p', when:T('3–4 months','3–4 bulan'),
      title:T('Intake & self-service','Intake & layanan mandiri'),
      items:[
        {ic:'send',   t:T('Asset request & procurement intake','Permintaan aset & intake pengadaan'),
         d:T('Employees request assets; approval routes to manager + finance; approved requests open a PO and pre-register the asset.',
             'Karyawan minta aset; approval ke manajer + finance; request disetujui buka PO dan pra-registrasi aset.')},
        {ic:'user',   t:T('Employee self-service portal','Portal layanan mandiri karyawan'),
         d:T('A lightweight portal: see my assets, report a problem (auto-WO), request a loan, acknowledge handover.',
             'Portal ringan: lihat aset saya, lapor masalah (auto-WO), minta pinjaman, konfirmasi serah-terima.')},
        {ic:'photo',  t:T('Mobile app · field scanning','Aplikasi mobile · scan lapangan'),
         d:T('Native handheld + phone NFC/QR fallback for sites without fixed gates. Offline-first with sync.',
             'Handheld native + fallback NFC/QR HP untuk lokasi tanpa gate. Offline-first dengan sync.')},
      ],
    },
    {
      tag:'Phase 3', tone:'c', when:T('5–6 months','5–6 bulan'),
      title:T('Intelligence & integrations','Kecerdasan & integrasi'),
      items:[
        {ic:'sparkles', t:T('Predictive maintenance (IoT)','Predictive maintenance (IoT)'),
         d:T('Vibration / temperature / current sensors feed the health score. AI predicts failures before they happen.',
             'Sensor getaran / suhu / arus mengisi health score. AI prediksi kegagalan sebelum terjadi.')},
        {ic:'dash',   t:T('Executive analytics & TCO','Analitik eksekutif & TCO'),
         d:T('Total cost of ownership per asset, utilization heatmaps, custom dashboards, scheduled board reports.',
             'Total biaya kepemilikan per aset, heatmap utilisasi, dashboard kustom, laporan direksi terjadwal.')},
        {ic:'zap',    t:T('Open API & webhooks','API terbuka & webhooks'),
         d:T('REST + EPCIS 2.0 endpoints, webhooks for events, and a connector marketplace (HR, ERP, ITSM).',
             'Endpoint REST + EPCIS 2.0, webhook untuk event, dan marketplace konektor (HR, ERP, ITSM).')},
      ],
    },
  ];
  const toneFor = (x) => x==='p'?'purple':x==='c'?'cyan':'brand';
  return (
    <div className="card card-b" style={{padding:24}}>
      <DocH>{T('Roadmap · Rollout Plan','Roadmap · Rencana Rilis')}</DocH>
      <DocLead>
        {T(
          'What is live today and what we recommend rolling out next — the additional “basics” that round out a complete fixed-asset platform. Sequenced so each phase builds on the last.',
          'Apa yang sudah live hari ini dan apa yang kami rekomendasikan dirilis berikutnya — “basic” tambahan yang melengkapi platform aset tetap. Diurutkan agar tiap fase membangun fase sebelumnya.'
        )}
      </DocLead>

      <DocCallout tone="s" icon="check" title={T('Live today · 9 core modules','Live hari ini · 9 modul inti')}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7, marginTop:8}}>
          {live.map((x,i)=>(
            <div key={i} style={{display:'flex', alignItems:'center', gap:7, fontSize:11}}>
              <div className="ico s" style={{width:20, height:20, borderRadius:4}}><Icon n={x.ic} s={10}/></div>{x.l}
            </div>
          ))}
        </div>
      </DocCallout>

      {phases.map((p,pi)=>(
        <div key={pi} style={{marginTop:22}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
            <span className={`b ${p.tone}`} style={{fontSize:10.5}}>{p.tag}</span>
            <span style={{fontSize:14, fontWeight:650}}>{p.title}</span>
            <span style={{fontSize:11, color:'var(--text-3)', marginLeft:'auto'}}>{p.when}</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10}}>
            {p.items.map((it,ii)=>(
              <div key={ii} style={{padding:13, background:'var(--surface-2)', borderRadius:9, border:'1px solid var(--border-soft)'}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:7}}>
                  <div className={`ico ${p.tone}`} style={{width:28, height:28}}><Icon n={it.ic} s={13}/></div>
                  <div style={{fontSize:12, fontWeight:600, lineHeight:1.25}}>{it.t}</div>
                </div>
                <div style={{fontSize:11, color:'var(--text-2)', lineHeight:1.55}}>{it.d}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{marginTop:22, padding:14, borderRadius:10, background:'linear-gradient(90deg, var(--brand-soft), color-mix(in oklab, var(--brand-soft) 40%, var(--surface-2)))', border:'1px solid color-mix(in oklab, var(--brand) 26%, var(--border))', display:'flex', alignItems:'center', gap:12}}>
        <div className="ico i" style={{width:34, height:34}}><Icon n="sparkles" s={15}/></div>
        <div style={{flex:1, fontSize:11.5, color:'var(--text-2)', lineHeight:1.55}}>
          {T('Each phase is independently shippable — we can re-prioritize based on your audit deadlines, finance close cycle, or safety/compliance needs.',
             'Tiap fase bisa dirilis independen — kami bisa re-prioritas sesuai deadline audit, siklus tutup buku finance, atau kebutuhan safety/kepatuhan Anda.')}
        </div>
        <button className="btn btn-sm btn-primary" onClick={()=>navigate('dashboard')}><Icon n="dash" s={11}/>{T('Back to dashboard','Ke dashboard')}</button>
      </div>
    </div>
  );
}

/* === SECTION: FAQ === */
function DocsFAQ({T, en}){
  const [open, setOpen] = useState(0);
  const faqs = [
    {q:T('What if I lose the RFID tag?','Bagaimana kalau tag RFID hilang?'),
     a:T('Re-print from RFID Tags → Print. Encode the same EPC (rebind) or assign a fresh one and bind it to the asset ID. Old tag is killed automatically when a new tag is bound.',
         'Cetak ulang dari RFID Tags → Print. Encode EPC yang sama (rebind) atau assign EPC baru lalu bind ke ID aset. Tag lama auto-kill saat tag baru di-bind.')},
    {q:T('Can one asset have multiple tags?','Bisakah satu aset punya beberapa tag?'),
     a:T('Yes — common for vehicles (windshield + chassis). Each EPC is bound to the same asset record. Any tag reading = same asset detected.',
         'Bisa — umum untuk kendaraan (windshield + chassis). Tiap EPC di-bind ke record aset yang sama. Tag mana pun terbaca = aset yang sama terdeteksi.')},
    {q:T('Does it work offline?','Apakah jalan offline?'),
     a:T('Yes — handheld readers cache scans locally. When network returns, they sync. Gate readers cache up to 100k events. Reconciliation is automatic.',
         'Ya — handheld reader cache scan lokal. Saat jaringan kembali, sync. Gate reader cache hingga 100k event. Reconciliation otomatis.')},
    {q:T('How accurate is the read range?','Seberapa akurat jarak baca?'),
     a:T('Fixed gate antennas: 4–6 meters typical. Handheld (Zebra MC3300xR): up to 9 meters line-of-sight. Through-metal: degraded — use on-metal tags for machinery.',
         'Antena gate fixed: tipikal 4–6 meter. Handheld (Zebra MC3300xR): hingga 9 meter line-of-sight. Tembus logam: terdegradasi — pakai on-metal tag untuk mesin.')},
    {q:T('Is this compliant with PSAK 16?','Apakah patuh PSAK 16?'),
     a:T('Yes. Depreciation engine supports straight-line, declining-balance, units-of-production. Auto-posts to Accurate / SAP / Odoo via integration. Audit-trail meets DJP requirements.',
         'Ya. Engine penyusutan mendukung straight-line, declining-balance, units-of-production. Auto-post ke Accurate / SAP / Odoo via integrasi. Audit-trail memenuhi syarat DJP.')},
    {q:T('Can I import existing assets in bulk?','Bisakah import aset existing secara bulk?'),
     a:T('Yes. Master Data → Import CSV (template provided). Bind RFID tags later via the Scan-In wizard or RFID Tags → Bind.',
         'Bisa. Master Data → Import CSV (template tersedia). Bind tag RFID nanti via Scan-In wizard atau RFID Tags → Bind.')},
    {q:T('What languages does it support?','Bahasa apa saja yang didukung?'),
     a:T('English (EN) and Bahasa Indonesia (ID) for the UI. Toggle from the top-right EN/ID button. Asset names, locations, and free-text fields are unchanged.',
         'English (EN) dan Bahasa Indonesia (ID) untuk UI. Toggle dari tombol EN/ID kanan atas. Nama aset, lokasi, dan field free-text tidak berubah.')},
    {q:T('Who can see which assets?','Siapa bisa lihat aset apa?'),
     a:T('Permissions are role + scope based. Custodians see only their own assets. Auditors see read-only across scope. Admins see everything. Configure in User Management.',
         'Permission berbasis peran + scope. Custodian hanya lihat aset miliknya. Auditor lihat read-only lintas scope. Admin lihat semuanya. Atur di Manajemen User.')},
    {q:T('What integrations are supported?','Integrasi apa saja yang didukung?'),
     a:T('ERP: Accurate, SAP, Odoo. Identity: Microsoft Entra ID, Google Workspace. Notifications: Slack, WhatsApp Business, Email. Printers: Zebra ZT-series, SATO. RFID: Impinj, Zebra readers.',
         'ERP: Accurate, SAP, Odoo. Identity: Microsoft Entra ID, Google Workspace. Notifikasi: Slack, WhatsApp Business, Email. Printer: Zebra ZT-series, SATO. RFID: reader Impinj, Zebra.')},
  ];
  return (
    <div className="card card-b" style={{padding:24}}>
      <DocH>{T('Frequently Asked Questions','Tanya Jawab')}</DocH>
      <DocLead>{T('Common questions from new users.','Pertanyaan umum dari user baru.')}</DocLead>
      <div style={{display:'flex', flexDirection:'column', gap:6}}>
        {faqs.map((f,i)=>(
          <div key={i} style={{border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', background:'var(--surface-2)'}}>
            <button onClick={()=>setOpen(open===i?-1:i)} style={{display:'flex', alignItems:'center', gap:10, padding:'12px 14px', width:'100%', textAlign:'left'}}>
              <Icon n="help" s={13} c="var(--brand-strong)"/>
              <span style={{flex:1, fontSize:12.5, fontWeight:600}}>{f.q}</span>
              <Icon n="chev" s={11} c="var(--text-3)" style={{transform: open===i?'rotate(90deg)':'rotate(0)', transition:'transform .14s'}}/>
            </button>
            {open===i && (
              <div style={{padding:'0 14px 14px 38px', fontSize:11.5, color:'var(--text-2)', lineHeight:1.6}}>{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* === SECTION: Glossary === */
function DocsGlossary({T, en}){
  const terms = [
    {t:'RFID',        d:T('Radio-Frequency Identification. Wireless tag-and-reader system.','Identifikasi Frekuensi Radio. Sistem tag-and-reader nirkabel.')},
    {t:'EPC',         d:T('Electronic Product Code. 96-bit globally unique identifier on each tag.','Electronic Product Code. Identitas unik global 96-bit pada tiap tag.')},
    {t:'Gen2',        d:T('EPC Generation 2 — current air-protocol standard for passive UHF RFID.','EPC Generasi 2 — standar protokol udara saat ini untuk RFID UHF pasif.')},
    {t:'UHF',         d:T('Ultra-High Frequency (860–960 MHz). Best balance of read range and tag cost.','Ultra-High Frequency (860–960 MHz). Balance terbaik antara jarak baca dan biaya tag.')},
    {t:'EPCIS 2.0',   d:T('GS1 event-log standard. Every read becomes a structured event record.','Standar event-log GS1. Tiap pembacaan jadi record event terstruktur.')},
    {t:'TID',         d:T('Tag Identifier — factory-set, immutable. Used to prevent tag cloning.','Tag Identifier — set pabrik, tidak dapat diubah. Untuk cegah cloning tag.')},
    {t:'RSSI',        d:T('Received Signal Strength Indicator. Used to estimate proximity.','Indikator Kekuatan Sinyal Diterima. Untuk estimasi jarak.')},
    {t:'Custodian',   d:T('Person currently responsible for an asset.','Orang yang saat ini bertanggung jawab atas aset.')},
    {t:'WO',          d:T('Work Order — a job ticket. Source can be PM, corrective, inspection, transfer, disposal, audit.','Work Order — tiket pekerjaan. Source bisa PM, corrective, inspection, mutasi, disposal, audit.')},
    {t:'PM',          d:T('Preventive Maintenance — scheduled service to prevent failure.','Preventive Maintenance — service terjadwal untuk cegah kegagalan.')},
    {t:'MTBF',        d:T('Mean Time Between Failures. Higher = more reliable.','Rata-rata waktu antar kegagalan. Lebih tinggi = lebih reliable.')},
    {t:'MTTR',        d:T('Mean Time To Repair. Lower = faster recovery.','Rata-rata waktu untuk perbaikan. Lebih rendah = recovery lebih cepat.')},
    {t:'NBV',         d:T('Net Book Value — original cost minus accumulated depreciation.','Nilai Buku Bersih — biaya awal dikurangi akumulasi penyusutan.')},
    {t:'PSAK 16',     d:T('Indonesian accounting standard for property, plant & equipment.','Standar akuntansi Indonesia untuk aset tetap.')},
    {t:'Geofence',    d:T('Virtual perimeter defined in software. Crossing it triggers an alert.','Perimeter virtual didefinisikan di software. Melintasinya men-trigger alert.')},
    {t:'RTLS',        d:T('Real-Time Location System. Continuous position tracking via RFID + Bluetooth + UWB.','Real-Time Location System. Pelacakan posisi terus-menerus via RFID + Bluetooth + UWB.')},
    {t:'K3 / SMK3',   d:T('Indonesian occupational health & safety standard. Aligned with ISO 45001.','Standar Kesehatan Keselamatan Kerja Indonesia. Selaras dengan ISO 45001.')},
    {t:'Cycle Count', d:T('Periodic count of a subset of inventory rather than full annual count.','Penghitungan periodik untuk subset inventori, bukan full count tahunan.')},
  ];
  return (
    <div className="card card-b" style={{padding:24}}>
      <DocH>{T('Glossary · RFID & CMMS Terms','Daftar Istilah · RFID & CMMS')}</DocH>
      <DocLead>{T('Reference for the acronyms and terms you\'ll meet across the platform.','Referensi singkatan dan istilah yang akan Anda temui di platform.')}</DocLead>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        {terms.map((t,i)=>(
          <div key={i} style={{padding:12, background:'var(--surface-2)', borderRadius:7, border:'1px solid var(--border-soft)'}}>
            <div className="mono" style={{fontSize:12, fontWeight:700, color:'var(--brand-strong)', marginBottom:3}}>{t.t}</div>
            <div style={{fontSize:11.5, color:'var(--text-2)', lineHeight:1.55}}>{t.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- NOTIFICATION INBOX --- */
function NotificationInbox({open, onClose, navigate, lang, toast}){
  if (!open) return null;
  const en = lang === 'en';

  const groups = [
    {label: en?'Today':'Today', items:[
      {t:'2m ago',   icon:'alert',  tone:'d', title: en?'Loss prevention · IT-LP-9847':'Loss prevention · IT-LP-9847', body: en?'Attempted exit without checkout · CCTV auto-tagged':'Mencoba keluar tanpa checkout · CCTV otomatis di-tag', go:'security'},
      {t:'14m',      icon:'sparkles',tone:'i',title: en?'AI predictive · MC-CN-0011':'AI predictive · MC-CN-0011',     body: en?'Spindle vibration +28% · bearing replacement recommended':'Spindle vibration +28% · recommend ganti bearing',     go:'maintenance'},
      {t:'42m',      icon:'wrench',  tone:'w',title: en?'Work order WO-2410-088 opened':'WO-2410-088 dibuka',                body: en?'Critical priority · 4-7d ETA':'Critical priority · ETA 4-7 hari',                go:'maintenance'},
      {t:'1h',       icon:'check',   tone:'s',title: en?'Audit zone B3 complete':'Stock opname zona B3 selesai',           body:'184 / 184 · 0 variance',                  go:'audit'},
      {t:'2h',       icon:'swap',    tone:'i',title: en?'Transfer received':'Mutasi diterima',                                body:'Server SV-2240 · JKT-DC Rack B-12',     go:'transfer'},
    ]},
    {label: en?'Yesterday':'Kemarin', items:[
      {t:'17:42',    icon:'qr',      tone:'s',title: en?'Print batch completed':'Print batch selesai',                       body:'24 RFID tags · MacBook Pro batch · Zebra ZT411 IT-A',  go:'rfid'},
      {t:'14:18',    icon:'cal',     tone:'w',title: en?'PM reminder · ICU monitors':'Reminder PM · Monitor ICU',           body: en?'Battery replacement due in 7 days':'Ganti baterai dalam 7 hari',           go:'maintenance'},
      {t:'09:22',    icon:'users',   tone:'',  title: en?'User invite accepted':'Undangan user diterima',                    body:'Citra Wijaya · IT Support',              go:'users'},
    ]},
    {label: en?'This week':'Minggu ini', items:[
      {t:'Mon',      icon:'shield',  tone:'',  title: en?'Calibration certificate uploaded':'Sertifikat kalibrasi di-upload', body:'Mettler PH Meter LB-PH-0008 · ISO 17025',           go:'masterdata'},
      {t:'Sun',      icon:'dollar',  tone:'',  title: en?'Monthly depreciation posted':'Depresiasi bulanan di-posting',      body: en?'Rp 154 jt to GL · auto-posted':'Rp 154 jt ke GL · auto-posted',                go:'settings'},
      {t:'Sat',      icon:'tag',     tone:'',  title: en?'EPC whitelist updated':'EPC whitelist di-update',                  body: en?'+2 ranges added · IT + Tools':'+2 range ditambahkan · IT + Tools',           go:'rfid'},
    ]},
  ];
  const totalUnread = 3;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose}/>
      <div className="sheet" style={{width:440}}>
        <div style={{padding:'18px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:16, fontWeight:650, letterSpacing:'-0.01em'}}>{en?'Notifications':'Notifikasi'}</div>
            <div style={{fontSize:11, color:'var(--text-3)', marginTop:2}}>
              <span className="b d dot" style={{fontSize:9.5}}>{totalUnread} {en?'unread':'belum dibaca'}</span>
              <span style={{marginLeft:8}}>{en?'across all sources':'dari semua sumber'}</span>
            </div>
          </div>
          <div style={{display:'flex', gap:6}}>
            <button className="btn btn-sm btn-ghost" onClick={()=>toast(en?'All notifications marked as read':'Semua notifikasi ditandai sudah dibaca')}>{en?'Mark all read':'Tandai dibaca'}</button>
            <button className="btn btn-i" onClick={onClose}><Icon n="x" s={14}/></button>
          </div>
        </div>

        <div style={{padding:'10px 14px', borderBottom:'1px solid var(--border)', display:'flex', gap:5, overflow:'auto'}}>
          {['All','Alert','Maintenance','Audit','Finance','System'].map((f,i) => (
            <button key={f} className={`chip ${i===0?'on':''}`} onClick={()=>toast(`Filter: ${f}`)}>{f}</button>
          ))}
        </div>

        <div style={{flex:1, overflow:'auto'}}>
          {groups.map(g => (
            <div key={g.label}>
              <div style={{padding:'14px 20px 6px', fontSize:10.5, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em'}}>{g.label}</div>
              {g.items.map((it,i)=>(
                <div key={i} onClick={()=>{ if(it.go) navigate(it.go); onClose(); }} style={{
                  display:'flex', alignItems:'flex-start', gap:11,
                  padding:'12px 20px', borderBottom:'1px solid var(--border-soft)',
                  cursor:'pointer', transition:'background .12s',
                }} onMouseEnter={(e)=>{e.currentTarget.style.background='rgba(59,130,246,.05)'}}
                   onMouseLeave={(e)=>{e.currentTarget.style.background='transparent'}}>
                  <div className={`ico ${it.tone||''}`} style={{width:32, height:32, borderRadius:8}}><Icon n={it.icon} s={14}/></div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12.5, fontWeight:600}}>{it.title}</div>
                    <div style={{fontSize:11, color:'var(--text-2)', marginTop:3, lineHeight:1.4}}>{it.body}</div>
                    <div style={{fontSize:10, color:'var(--text-3)', marginTop:4}}>{it.t}</div>
                  </div>
                  <Icon n="chev" s={12}/>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{padding:12, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:'var(--text-3)'}}>
          <span>{en?'Delivered via':'Dikirim via'} <b className="mono" style={{color:'var(--text-2)'}}>Email · WhatsApp · Slack</b></span>
          <button className="btn btn-sm btn-ghost" onClick={()=>{navigate('settings'); onClose();}}><Icon n="cog" s={11}/>{en?'Manage':'Kelola'}</button>
        </div>
      </div>
    </>
  );
}

/* --- COMMAND PALETTE (⌘K) --- */
function CmdPalette({open, onClose, navigate, lang, toast}){
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQ(''); setIdx(0); setTimeout(()=>inputRef.current?.focus(), 50); }
  }, [open]);

  if (!open) return null;
  const en = lang === 'en';

  const allItems = [
    {type:'route', id:'dashboard',  label: en?'Dashboard':'Dashboard',                icon:'dash',   hint: en?'Overview':'Ringkasan'},
    {type:'route', id:'register',   label: en?'Asset Register':'Daftar Aset',         icon:'box',    hint:'12,420 aset'},
    {type:'route', id:'rfid',       label: en?'RFID Tags · Print':'Tag RFID · Cetak',  icon:'qr',     hint: en?'24 queued':'24 di antrian'},
    {type:'route', id:'scan-in',    label: en?'Scan-In · Receiving':'Scan-In · Penerimaan',  icon:'arrin', hint:'28 pending'},
    {type:'route', id:'scan-out',   label: en?'Scan-Out · Disposal':'Scan-Out · Pelepasan',  icon:'arrout',hint:'8 awaiting approval'},
    {type:'route', id:'checkout',   label: en?'Check-Out · Loans':'Check-Out · Peminjaman', icon:'swap', hint: en?'6 on loan':'6 dipinjam'},
    {type:'route', id:'transfer',   label: en?'Transfer':'Mutasi Aset',                icon:'swap',   hint:'18 in transit'},
    {type:'route', id:'audit',      label: en?'Stock Audit':'Stock Opname',           icon:'audit',  hint:'Q4 · 78% complete'},
    {type:'route', id:'maintenance',label: en?'Work Orders':'Work Orders',             icon:'wrench', hint:'42 open'},
    {type:'route', id:'masterdata', label: en?'Master Data':'Data Master',             icon:'db',     hint: en?'6 reference tables':'6 tabel referensi'},
    {type:'route', id:'rtls',       label: en?'Real-Time Location':'Lokasi Real-Time',  icon:'pin',    hint: en?'2,420 tracked':'2,420 dilacak'},
    {type:'route', id:'security',   label: en?'Loss Prevention':'Loss Prevention',      icon:'shield', hint: en?'3 active alerts':'3 alert aktif'},
    {type:'route', id:'users',      label: en?'User Management':'Manajemen User',      icon:'users',  hint:'142 users'},
    {type:'route', id:'settings',   label: en?'Settings':'Pengaturan',                  icon:'cog',    hint: en?'workspace · reminders · security':'workspace · reminders · security'},
    {type:'action', id:'scan-in-quick', label: en?'New asset receiving (Scan-In)':'Penerimaan aset baru (Scan-In)', icon:'plus', go:'scan-in', shortcut:'N'},
    {type:'action', id:'audit-quick',    label: en?'Continue audit sweep':'Lanjutkan stock opname', icon:'play', go:'audit'},
    {type:'action', id:'wo-quick',       label: en?'New work order':'Buat work order baru', icon:'wrench', go:'maintenance'},
    {type:'action', id:'print-quick',    label: en?'Print RFID tags (queue)':'Cetak tag RFID (antrian)', icon:'qr', go:'rfid'},
    ...ASSETS.map(a => ({type:'asset', id:'a-'+a.id, label:a.name, icon:catIcon[a.cat], hint: a.id + ' · ' + a.loc + ' · ' + a.custodian, assetId:a.id})),
  ];

  const filtered = q
    ? allItems.filter(it => (it.label + ' ' + (it.hint||'')).toLowerCase().includes(q.toLowerCase())).slice(0, 18)
    : allItems.slice(0, 13);

  const go = (it) => {
    if (it.type === 'route') navigate(it.id);
    else if (it.type === 'asset') navigate('detail', {assetId: it.assetId});
    else if (it.type === 'action' && it.go) navigate(it.go);
    onClose();
  };

  const handleKey = (e) => {
    if (e.key==='ArrowDown') { e.preventDefault(); setIdx(i=>Math.min(i+1, filtered.length-1)); }
    if (e.key==='ArrowUp')   { e.preventDefault(); setIdx(i=>Math.max(i-1, 0)); }
    if (e.key==='Enter')     { e.preventDefault(); if (filtered[idx]) go(filtered[idx]); }
    if (e.key==='Escape')    { e.preventDefault(); onClose(); }
  };

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd" onClick={e=>e.stopPropagation()}>
        <div className="cmd-search">
          <Icon n="search" s={16}/>
          <input ref={inputRef} placeholder={en?'Type to search assets, pages, actions…':'Ketik untuk cari aset, halaman, aksi…'} value={q} onChange={e=>{setQ(e.target.value); setIdx(0);}} onKeyDown={handleKey}/>
          <span className="kbd">ESC</span>
        </div>
        <div className="cmd-list">
          {filtered.length === 0 && <div className="cmd-empty">{en?'No matches · try a different query':'Tidak ada hasil · coba kata lain'}</div>}
          {filtered.map((it,i) => (
            <div key={it.id} className={`cmd-item ${i===idx?'on':''}`} onClick={()=>go(it)} onMouseEnter={()=>setIdx(i)}>
              <div className={`ico ${it.type==='asset'?'c':it.type==='action'?'s':'i'}`} style={{width:28, height:28, borderRadius:6}}><Icon n={it.icon} s={13}/></div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:12.5, fontWeight:600}}>{it.label}</div>
                {it.hint && <div style={{fontSize:10.5, color:'var(--text-3)', marginTop:1}}>{it.hint}</div>}
              </div>
              <span className={`b ${it.type==='asset'?'c':it.type==='action'?'s':'i'}`} style={{fontSize:9.5}}>{it.type==='asset'?(en?'Asset':'Aset'):it.type==='action'?(en?'Action':'Aksi'):(en?'Page':'Halaman')}</span>
            </div>
          ))}
        </div>
        <div className="cmd-foot">
          <span><span className="kbd">↑</span> <span className="kbd">↓</span> {en?'navigate':'navigasi'}</span>
          <span><span className="kbd">↵</span> {en?'select':'pilih'}</span>
          <span><span className="kbd">⌘K</span> {en?'toggle':'buka/tutup'}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   --- CHECK-OUT / LOANS ---
   Basic fixed-asset feature: lend & reserve tools/equipment,
   track who has what, due dates, overdue, and RFID return.
============================================================ */
const LOANS = [
  {id:'LN-2410-0042', asset:'Hilti TE 6-A22 Hammer Drill', aid:'TL-DR-0142', cat:'tool', who:'Eko P.',   dept:'Maintenance', out:'2 days ago',  due:'in 1 day',   dueTone:'w', status:'on-loan',  cond:'good'},
  {id:'LN-2410-0041', asset:'Impact Wrench MT-2880',       aid:'TL-IM-0084', cat:'tool', who:'Galang T.',dept:'Workshop',    out:'5 days ago',  due:'2 days overdue', dueTone:'d', status:'overdue', cond:'good'},
  {id:'LN-2410-0040', asset:'Werner 28ft Ladder',          aid:'TL-LA-0088', cat:'tool', who:'Andi P.',  dept:'Facilities',  out:'today',       due:'in 6 days',  dueTone:'', status:'on-loan',  cond:'good'},
  {id:'LN-2410-0039', asset:'Dell Latitude 7440 (loaner)', aid:'IT-LP-0231', cat:'it',   who:'Citra W.', dept:'Finance',     out:'1 week ago',  due:'in 3 weeks', dueTone:'', status:'on-loan',  cond:'good'},
  {id:'LN-2410-0038', asset:'Bosch GLM 50C Laser Meter',   aid:'TL-LM-0112', cat:'tool', who:'Rahmat S.',dept:'Survey',      out:'3 days ago',  due:'in 4 days',  dueTone:'', status:'on-loan',  cond:'good'},
  {id:'LN-2410-0037', asset:'Projector Epson EB-2250U',    aid:'IT-PJ-0067', cat:'it',   who:'Dewi A.',  dept:'Marketing',   out:'4 hours ago', due:'today 17:00',dueTone:'w', status:'on-loan',  cond:'good'},
];
const RESERVATIONS = [
  {asset:'Toyota Hilux Forklift', aid:'VH-FK-0041', who:'Andi P.',   when:'Tomorrow 08:00', dur:'Full day',  cat:'veh'},
  {asset:'Bosch GLM Laser Meter', aid:'TL-LM-0112', who:'Survey Team',when:'Thu 09:00',      dur:'2 days',    cat:'tool'},
  {asset:'Projector EB-2250U',    aid:'IT-PJ-0067', who:'HR Training',when:'Fri 13:00',      dur:'4 hours',   cat:'it'},
];

function CheckoutPage({navigate, toast, lang}){
  const en = lang === 'en';
  const T = (e,i) => en ? e : i;
  const [tab, setTab] = useState('active');
  const [q, setQ] = useState('');
  const [coOpen, setCoOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const [extraLoans, setExtraLoans] = usePersisted('kfa_loans', []);
  const [extraRes, setExtraRes] = usePersisted('kfa_reservations', []);
  const loans = [...extraLoans, ...LOANS].filter(l => !q || (l.asset+l.who+l.aid).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page page-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">{T('Check-Out · Loans','Check-Out · Peminjaman')}</h1>
          <p className="page-desc">
            {T(
              'Lend and reserve shared tools, equipment, and loaner devices. RFID gate scan checks items out and back in automatically — with due dates, overdue alerts, and condition logging.',
              'Pinjamkan dan reservasi alat, peralatan, dan device loaner bersama. Scan gate RFID otomatis check-out dan check-in — dengan jatuh tempo, alert overdue, dan log kondisi.'
            )}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={()=>{setTab('reserve'); toast(T('Reservations opened','Reservasi dibuka'));}}><Icon n="cal" s={13}/>{T('Reserve','Reservasi')}</button>
          <button className="btn btn-primary" onClick={()=>setCoOpen(true)}><Icon n="qr" s={13}/>{T('Check out asset','Pinjam aset')}</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18}}>
        <Stat label={T('On loan now','Sedang dipinjam')} value="6"  sub={T('across 5 departments','di 5 departemen')}      tone="brand"   icon="arrout"/>
        <Stat label={T('Overdue','Overdue')}              value="1"  sub={T('Impact Wrench · 2 days','Impact Wrench · 2 hari')} tone="danger"  icon="clock"/>
        <Stat label={T('Due today','Jatuh tempo hari ini')}value="2"  sub={T('send reminder','kirim pengingat')}          tone="warn"    icon="bell"/>
        <Stat label={T('Reserved','Direservasi')}          value="3"  sub={T('next: tomorrow 08:00','berikutnya: besok 08:00')} tone="success" icon="cal"/>
      </div>

      <div className="tabs">
        {[
          {id:'active',  l:T('Active loans · 6','Pinjaman aktif · 6'), icon:'arrout'},
          {id:'reserve', l:T('Reservations · 3','Reservasi · 3'),       icon:'cal'},
          {id:'history', l:T('Return history','Riwayat kembali'),       icon:'refresh'},
        ].map(t => (
          <button key={t.id} className={`tab ${tab===t.id?'on':''}`} onClick={()=>setTab(t.id)}>
            <span style={{display:'inline-flex', alignItems:'center', gap:7}}><Icon n={t.icon} s={12}/>{t.l}</span>
          </button>
        ))}
      </div>

      {tab === 'active' && (
        <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:14}}>
          <div className="card">
            <div className="card-h">
              <div className="card-t">{T('Currently checked out','Sedang dipinjam')}</div>
              <div className="tb-search" style={{maxWidth:220}}>
                <Icon n="search" s={13}/>
                <input placeholder={T('Search loans…','Cari pinjaman…')} value={q} onChange={e=>setQ(e.target.value)}/>
              </div>
            </div>
            <table className="tbl">
              <thead>
                <tr><th>{T('Asset','Aset')}</th><th>{T('Borrower','Peminjam')}</th><th>{T('Out','Keluar')}</th><th>{T('Due','Jatuh tempo')}</th><th></th></tr>
              </thead>
              <tbody>
                {loans.map((l,i)=>(
                  <tr key={l.id} className="row-link" onClick={()=>navigate('detail', {assetId:l.aid})}>
                    <td>
                      <div className="cell-asset">
                        <div className={`ico ${catTone[l.cat]}`} style={{width:28, height:28, borderRadius:5}}><Icon n={catIcon[l.cat]} s={12}/></div>
                        <div>
                          <div className="asset-name" style={{fontSize:12}}>{l.asset}</div>
                          <div className="asset-id">{l.aid}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:7}}>
                        <Avatar name={l.who} i={i} size={22}/>
                        <div>
                          <div style={{fontSize:12, fontWeight:550}}>{l.who}</div>
                          <div style={{fontSize:10, color:'var(--text-3)'}}>{l.dept}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:11.5, color:'var(--text-2)'}}>{l.out}</td>
                    <td><span className={`b ${l.dueTone} ${l.dueTone?'dot':''}`}>{l.due}</span></td>
                    <td style={{textAlign:'right'}}>
                      <button className="btn btn-sm" onClick={(e)=>{e.stopPropagation(); toast(T('Return: scan tag at gate','Kembali: scan tag di gate')+' · '+l.aid);}}>
                        <Icon n="arrin" s={11}/>{T('Return','Kembali')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-h"><div className="card-t">{T('How check-out works','Cara peminjaman')}</div></div>
            <div className="card-b">
              {[
                {ic:'qr',     t:T('1 · Scan to check out','1 · Scan untuk pinjam'),  d:T('Borrower scans the asset tag + their badge at the crib gate. Loan record opens automatically.','Peminjam scan tag aset + badge di gate crib. Record pinjaman otomatis terbuka.')},
                {ic:'cal',    t:T('2 · Set a due date','2 · Set jatuh tempo'),        d:T('Default per category (tools 7d, IT loaner 30d). System sends reminders before due.','Default per kategori (alat 7h, IT loaner 30h). Sistem kirim pengingat sebelum jatuh tempo.')},
                {ic:'arrin',  t:T('3 · Return scan','3 · Scan kembali'),               d:T('Returning the asset past the gate auto-closes the loan and logs condition.','Mengembalikan aset lewat gate auto-close pinjaman dan log kondisi.')},
                {ic:'alert',  t:T('4 · Overdue escalation','4 · Eskalasi overdue'),     d:T('Overdue items notify the borrower + manager. Repeat offenders flagged.','Item overdue notifikasi peminjam + manajer. Pelanggar berulang ditandai.')},
              ].map((s,i)=>(
                <div key={i} style={{display:'flex', gap:11, marginBottom:i<3?14:0}}>
                  <div className="ico i" style={{width:30, height:30, flexShrink:0}}><Icon n={s.ic} s={13}/></div>
                  <div>
                    <div style={{fontSize:12.5, fontWeight:600}}>{s.t}</div>
                    <div style={{fontSize:11, color:'var(--text-2)', marginTop:2, lineHeight:1.5}}>{s.d}</div>
                  </div>
                </div>
              ))}
              <div style={{marginTop:14, padding:11, background:'var(--surface-2)', borderRadius:7, fontSize:11, color:'var(--text-2)', lineHeight:1.5}}>
                <b style={{color:'var(--text)'}}>{T('Connected to','Terhubung ke')}:</b> {T('Scan-Out fires the loan event · Maintenance flags items needing inspection before re-loan · Loss Prevention alerts if an asset leaves without checkout.','Scan-Out memicu event pinjam · Maintenance tandai item yang perlu inspeksi sebelum dipinjam lagi · Loss Prevention alert jika aset keluar tanpa checkout.')}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'reserve' && (
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">{T('Upcoming reservations','Reservasi mendatang')}</div>
              <div className="card-sub">{T('Book shared assets ahead of time · prevents double-booking','Booking aset bersama di awal · cegah double-booking')}</div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={()=>setResOpen(true)}><Icon n="plus" s={11}/>{T('New','Baru')}</button>
          </div>
          <table className="tbl">
            <thead><tr><th>{T('Asset','Aset')}</th><th>{T('Reserved by','Direservasi oleh')}</th><th>{T('When','Kapan')}</th><th>{T('Duration','Durasi')}</th><th></th></tr></thead>
            <tbody>
              {[...extraRes, ...RESERVATIONS].map((r,i)=>(
                <tr key={i} className="row-link" onClick={()=>navigate('detail', {assetId:r.aid})}>
                  <td>
                    <div className="cell-asset">
                      <div className={`ico ${catTone[r.cat]}`} style={{width:28, height:28, borderRadius:5}}><Icon n={catIcon[r.cat]} s={12}/></div>
                      <div><div className="asset-name" style={{fontSize:12}}>{r.asset}</div><div className="asset-id">{r.aid}</div></div>
                    </div>
                  </td>
                  <td style={{fontSize:12}}>{r.who}</td>
                  <td><span className="b i">{r.when}</span></td>
                  <td style={{fontSize:11.5, color:'var(--text-2)'}}>{r.dur}</td>
                  <td style={{textAlign:'right'}}><button className="btn btn-sm" onClick={(e)=>{e.stopPropagation(); toast(T('Reservation cancelled','Reservasi dibatalkan'));}}>{T('Cancel','Batal')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <div className="card-h"><div className="card-t">{T('Recent returns','Pengembalian terbaru')}</div><span className="b s dot">{T('all returned in good condition','semua kembali kondisi baik')}</span></div>
          <table className="tbl">
            <thead><tr><th>{T('Asset','Aset')}</th><th>{T('Borrower','Peminjam')}</th><th>{T('Returned','Dikembalikan')}</th><th>{T('Loan period','Periode')}</th><th>{T('Condition','Kondisi')}</th></tr></thead>
            <tbody>
              {[
                {a:'Hilti Angle Grinder', id:'TL-AG-0051', who:'Galang T.', ret:'Yesterday', per:'3 days',  cond:'good'},
                {a:'MacBook Air (loaner)',id:'IT-LP-0210', who:'Bayu R.',   ret:'2 days ago', per:'2 weeks', cond:'good'},
                {a:'Bosch Drill GSB',     id:'TL-DR-0143', who:'Andi P.',   ret:'3 days ago', per:'1 day',   cond:'wear'},
                {a:'Projector ViewSonic', id:'IT-PJ-0066', who:'HR Team',   ret:'5 days ago', per:'4 hours', cond:'good'},
              ].map((h,i)=>(
                <tr key={i}>
                  <td><div style={{fontSize:12, fontWeight:550}}>{h.a}</div><div className="asset-id">{h.id}</div></td>
                  <td style={{fontSize:12}}>{h.who}</td>
                  <td style={{fontSize:11.5, color:'var(--text-2)'}}>{h.ret}</td>
                  <td style={{fontSize:11.5, color:'var(--text-2)'}}>{h.per}</td>
                  <td><span className={`b ${h.cond==='good'?'s':'w'}`}>{h.cond==='good'?T('Good','Baik'):T('Wear noted','Ada aus')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CheckOutModal open={coOpen} onClose={()=>setCoOpen(false)} toast={toast}
        onSubmit={(r)=>{ setExtraLoans(x=>[{id:'LN-2410-00'+(43+x.length), asset:r.asset.name, aid:r.asset.id, cat:r.asset.cat, who:r.who, dept:'Operations', out:'just now', due:'in '+r.due, dueTone:'', status:'on-loan', cond:'good'}, ...x]); setTab('active'); }}/>
      <ReservationModal open={resOpen} onClose={()=>setResOpen(false)} toast={toast}
        onSubmit={(r)=>{ setExtraRes(x=>[{asset:r.asset.name, aid:r.asset.id, who:r.who, when:r.when, dur:r.dur, cat:r.asset.cat}, ...x]); setTab('reserve'); }}/>
    </div>
  );
}

/* ============================================================
   LOGIN SCREEN
============================================================ */
function LoginPage({onLogin, lang, setLang, theme, setTheme}){
  const en = lang === 'en';
  const T = (e, i) => en ? e : i;
  const [email, setEmail] = useState('asset.manager@katalyst.id');
  const [pw, setPw] = useState('demo1234');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(true);

  const submit = (e) => {
    e && e.preventDefault();
    setBusy(true);
    setTimeout(() => { onLogin(); }, 750);
  };

  return (
    <div className="login">
      {/* Left — form */}
      <div className="login-main">
        <div className="login-topbar">
          <div className="login-wordmark">
            <div className="login-logo">K</div>
            <div className="login-wordmark-t">Katalyst<small>Fixed Assets · RFID</small></div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <button className="tb-action" onClick={()=>setTheme(theme==='dark'?'light':'dark')} title="Theme">
              <Icon n={theme==='dark'?'sun':'moon'} s={15}/>
            </button>
          </div>
        </div>

        <form className="login-body" onSubmit={submit}>
          <h1 className="login-h1">{T('Welcome back','Selamat datang')}</h1>
          <p className="login-sub">{T('Sign in to your asset control center.','Masuk ke pusat kendali aset Anda.')}</p>

          <div className="login-field">
            <label className="login-label">{T('Work email','Email kantor')}</label>
            <div className="login-input-wrap">
              <span className="login-ico"><Icon n="user" s={15}/></span>
              <input className="login-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@katalyst.id" autoComplete="username"/>
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">{T('Password','Kata sandi')}</label>
            <div className="login-input-wrap">
              <span className="login-ico"><Icon n="lock" s={15}/></span>
              <input className="login-input" type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" autoComplete="current-password"/>
              <button type="button" className="login-eye" onClick={()=>setShowPw(s=>!s)} title={showPw?'Hide':'Show'}><Icon n="eye" s={15}/></button>
            </div>
          </div>

          <div className="login-row">
            <label className="login-check">
              <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>
              {T('Keep me signed in','Tetap masuk')}
            </label>
            <a className="login-link" onClick={(e)=>e.preventDefault()} href="#">{T('Forgot password?','Lupa sandi?')}</a>
          </div>

          <div className="login-mfa">
            <Icon n="shield" s={14} c="var(--success)"/>
            <span>{T('Multi-factor authentication (MFA) is enforced for your role.','Multi-factor authentication (MFA) wajib untuk peran Anda.')}</span>
          </div>

          <button className="login-btn" type="submit" disabled={busy}>
            {busy ? <><span className="ping" style={{background:'#fff', boxShadow:'0 0 8px #fff'}}/>{T('Signing in…','Masuk…')}</>
                  : <>{T('Sign in','Masuk')}<Icon n="arrout" s={15}/></>}
          </button>

          <div className="login-divider">{T('or continue with','atau lanjut dengan')}</div>

          <div className="login-sso">
            <button type="button" className="login-sso-btn" onClick={submit}>
              <Icon n="building" s={15} c="var(--brand-strong)"/>{T('Microsoft Entra ID (SSO)','Microsoft Entra ID (SSO)')}
            </button>
            <button type="button" className="login-sso-btn" onClick={submit}>
              <Icon n="qr" s={15} c="var(--cyan)"/>{T('Sign in with RFID badge','Masuk dengan kartu RFID')}
            </button>
          </div>

          <div className="login-foot">
            <span>© 2026 Katalyst Indonesia</span>
            <span style={{display:'flex', gap:12}}>
              <a className="login-link" href="#" onClick={e=>e.preventDefault()}>{T('Privacy','Privasi')}</a>
              <a className="login-link" href="#" onClick={e=>e.preventDefault()}>{T('Support','Bantuan')}</a>
            </span>
          </div>
        </form>
      </div>

      {/* Right — control-center visual */}
      <aside className="login-aside">
        <div className="login-aside-grid"/>
        <div>
          <div className="login-aside-eyebrow">{T('RFID Operations Control Center','Pusat Kendali Operasi RFID')}</div>
          <h2 className="login-aside-h">{T('Every asset. Tracked, traced, and accounted for — in real time.','Setiap aset. Terlacak, tertelusur, dan terhitung — secara real-time.')}</h2>
          <p className="login-aside-p">{T(
            'From receiving to disposal, Katalyst keeps your fixed-asset register accurate with passive RFID, automated work orders, and audit-grade event logs.',
            'Dari penerimaan hingga pelepasan, Katalyst menjaga daftar aset tetap akurat dengan RFID pasif, work order otomatis, dan event log berstandar audit.'
          )}</p>

          <div className="login-stats">
            {[
              {v:'12,420', l:T('Tracked assets','Aset terlacak')},
              {v:'99.4%',  l:T('Audit accuracy','Akurasi audit')},
              {v:'Rp 48 M',l:T('Asset value','Nilai aset')},
              {v:'< 2 min',l:T('Full stock count','Stock opname penuh')},
            ].map((s,i)=>(
              <div key={i} className="login-stat">
                <div className="login-stat-v">{s.v}</div>
                <div className="login-stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="login-feed">
          <div style={{fontSize:11, color:'#7da6e8', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4}}>
            <span className="ping" style={{marginRight:7}}/>{T('Live gate activity','Aktivitas gate live')}
          </div>
          {[
            {c:'#10b981', t:T('MacBook Pro · scanned in at JKT-HQ G8','MacBook Pro · scan masuk di JKT-HQ G8')},
            {c:'#3b82f6', t:T('Forklift VH-0041 · transfer to BDG-WH','Forklift VH-0041 · mutasi ke BDG-WH')},
            {c:'#f59e0b', t:T('CNC MC-0011 · PM work order created','CNC MC-0011 · work order PM dibuat')},
          ].map((f,i)=>(
            <div key={i} className="login-feed-item">
              <span className="login-feed-dot" style={{color:f.c, background:f.c}}/>{f.t}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ============================================================
   6. APP / ROUTER + TOASTS
============================================================ */
function App(){
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('kfa_authed') === '1');
  const [route, setRoute] = useState('dashboard');
  const [ctx, setCtx] = useState({});
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('kfa_theme') || 'dark');
  const [lang, setLang] = useState('en'); /* English-only — consistent demo language */
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [routeKey, setRouteKey] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kfa_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('kfa_lang', lang);
  }, [lang]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const navigate = (r, c={}) => {
    setRoute(r);
    setCtx(c);
    setRouteKey(k => k+1);
    window.scrollTo({ top: 0 });
  };
  const toast = (msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, {id, msg}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  };

  const pages = {
    dashboard:   <DashboardPage   navigate={navigate} toast={toast}/>,
    register:    <RegisterPage    navigate={navigate} toast={toast}/>,
    detail:      <DetailPage      navigate={navigate} ctx={ctx} toast={toast}/>,
    masterdata:  <MasterDataPage  navigate={navigate} toast={toast}/>,
    'scan-in':   <ScanInPage      navigate={navigate} toast={toast}/>,
    'scan-out':  <ScanOutPage     navigate={navigate} toast={toast}/>,
    transfer:    <TransferPage    navigate={navigate} toast={toast}/>,
    checkout:    <CheckoutPage    navigate={navigate} toast={toast} lang={lang}/>,
    audit:       <AuditPage       navigate={navigate} toast={toast}/>,
    maintenance: <MaintenancePage navigate={navigate} toast={toast} lang={lang}/>,
    rtls:        <RTLSPage        navigate={navigate} toast={toast}/>,
    security:    <SecurityPage    navigate={navigate} toast={toast}/>,
    users:       <UsersPage       navigate={navigate} toast={toast}/>,
    settings:    <SettingsPage    navigate={navigate} toast={toast}/>,
    rfid:        <RFIDTagsPage    navigate={navigate} toast={toast}/>,
    reports:     <ReportsPage     navigate={navigate} toast={toast}/>,
    docs:        <DocsPage        navigate={navigate} toast={toast} lang={lang} setLang={setLang}/>,
  };

  const login = () => { sessionStorage.setItem('kfa_authed','1'); setAuthed(true); };
  const logout = () => { sessionStorage.removeItem('kfa_authed'); setAuthed(false); };

  if (!authed) {
    return <LoginPage onLogin={login} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}/>;
  }

  return (
    <>
      <div className="app">
        <Sidebar route={route} setRoute={navigate} lang={lang} logout={logout}/>
        <div className="main">
          {routeKey > 0 && <div className="route-loader" key={routeKey}/>}
          <Topbar route={route} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} navigate={navigate} logout={logout} openCmd={()=>setCmdOpen(true)} openNotif={()=>setNotifOpen(true)}/>
          {pages[route] || <DashboardPage navigate={navigate} toast={toast}/>}
        </div>
      </div>

      {toasts.map(t => (
        <div key={t.id} className="toast">
          <Icon n="check" s={13} c=""/>
          <span>{t.msg}</span>
        </div>
      ))}

      <CmdPalette open={cmdOpen} onClose={()=>setCmdOpen(false)} navigate={navigate} lang={lang} toast={toast}/>
      <NotificationInbox open={notifOpen} onClose={()=>setNotifOpen(false)} navigate={navigate} lang={lang} toast={toast}/>
    </>
  );
}

/* Export shared primitives for modals.jsx (loaded before this file; resolved at render time) */
Object.assign(window, { Icon, Modal, Field, FieldRow, Stat, Meter, formatIDR, formatIDRShort, ASSETS, catIcon, catTone, catLabel });

const __root = ReactDOM.createRoot(document.getElementById('root'));
__root.render(<App/>);

// Dismiss splash screen after first render settles
setTimeout(() => {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('gone');
    setTimeout(() => splash.remove(), 500);
  }
}, 700);

// Re-arm in case host overlays clobber first render
requestAnimationFrame(() => {
  const root = document.getElementById('root');
  if (root && root.childElementCount === 0) __root.render(<App/>);
});
