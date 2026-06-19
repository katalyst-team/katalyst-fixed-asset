/* eslint-disable */
/* ============================================================
   KATALYST FIXED ASSETS — ACTION MODALS
   Loaded BEFORE app.jsx. Dependencies (Modal, Field, FieldRow,
   Icon, ASSETS, helpers) are pulled from window at RENDER time,
   after app.jsx has exported them.
============================================================ */

const KFA_PEOPLE = ['Dewi Anggraini','Rahmat Santoso','Andi Pratama','Budi Setiawan','Dr. Ratna Indira','Eko Pranata','Galang Tirta','Citra Wijaya'];
const KFA_LOCATIONS = ['JKT-HQ · Floor 8','JKT-HQ · Floor 12','JKT-DC · Rack B','JKT-Workshop','JKT-Lab · Station 3','BDG-Office · Floor 2','BDG-WH · Bay 1','MDN-Office','SBY-WH'];

/* Approval-chain preview row used in Disposal modal */
function KfaChain({steps}){
  const { Icon } = window;
  return (
    <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', padding:'10px 12px', background:'var(--surface-2)', borderRadius:7}}>
      {steps.map((s,i)=>(
        <React.Fragment key={i}>
          <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600, color:'var(--text-2)'}}>
            <span style={{width:18, height:18, borderRadius:5, background:'var(--brand-soft)', color:'var(--brand-strong)', display:'grid', placeItems:'center', fontSize:10, fontWeight:700}}>{i+1}</span>
            {s}
          </span>
          {i < steps.length-1 && <Icon n="chev" s={10} c="var(--text-4)"/>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* === 1. NEW DISPOSAL REQUEST === */
function DisposalRequestModal({open, onClose, toast, onSubmit}){
  const { Modal, Field, FieldRow, Icon, ASSETS } = window;
  const [asset, setAsset] = React.useState(ASSETS ? ASSETS[0].id : '');
  const [method, setMethod] = React.useState('Sold · auction');
  const [reason, setReason] = React.useState('');
  const [recovery, setRecovery] = React.useState('');
  if (!open) return null;
  const a = (ASSETS||[]).find(x=>x.id===asset);
  const submit = () => {
    if (!reason.trim()){ toast('Reason is required'); return; }
    onSubmit && onSubmit({asset:a, method, reason, recovery:Number(recovery)||0});
    onClose();
    toast('Disposal request submitted · routed to Dept Head');
  };
  return (
    <Modal open onClose={onClose} title="New disposal request" sub="Multi-step approval · auto journal entry · handover certificate (BAST) generated on sign-off"
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}><Icon n="check" s={12}/>Submit for approval</button></>}>
      <Field label="Asset" req type="select" value={asset} onChange={setAsset}
        options={(ASSETS||[]).map(x=>({v:x.id, l:`${x.name} · ${x.id}`}))}/>
      {a && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
          {[['Net book value', window.formatIDRShort(a.dep)], ['Location', a.loc], ['Custodian', a.custodian]].map(([l,v],i)=>(
            <div key={i} style={{padding:'8px 10px', background:'var(--surface-2)', borderRadius:6}}>
              <div style={{fontSize:9.5, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:600}}>{l}</div>
              <div style={{fontSize:12, fontWeight:600, marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
      )}
      <FieldRow>
        <Field label="Disposal method" req type="select" value={method} onChange={setMethod}
          options={['Sold · auction','Sold · direct','Scrapped / e-waste','Donated','Lost / written off','Obsolete · end of life','Return to vendor']}/>
        <Field label="Expected recovery (Rp)" type="number" value={recovery} onChange={setRecovery} placeholder="0" hint="Sale or auction proceeds, if any"/>
      </FieldRow>
      <Field label="Reason / justification" req type="textarea" value={reason} onChange={setReason}
        placeholder="e.g. 5-year EOL reached, repair cost exceeds 60% of replacement value…"/>
      <div>
        <div style={{fontSize:11, fontWeight:600, color:'var(--text-2)', marginBottom:6}}>Approval chain</div>
        <KfaChain steps={['Requester','Dept Head','Finance Manager','CFO','BAST + GL post']}/>
      </div>
      <div style={{fontSize:10.5, color:'var(--text-3)', lineHeight:1.5}}>
        On final approval the RFID tag is deactivated (kill password), the loss/gain entry posts to the GL, and the signed BAST PDF is emailed to all approvers.
      </div>
    </Modal>
  );
}

/* === 2. CHECK-OUT ASSET === */
function CheckOutModal({open, onClose, toast, onSubmit}){
  const { Modal, Field, FieldRow, Icon, ASSETS } = window;
  const avail = (ASSETS||[]).filter(a=>['idle','deployed'].includes(a.status));
  const [asset, setAsset] = React.useState(avail[0] ? avail[0].id : '');
  const [who, setWho] = React.useState(KFA_PEOPLE[0]);
  const [due, setDue] = React.useState('7 days');
  const [purpose, setPurpose] = React.useState('');
  if (!open) return null;
  const a = avail.find(x=>x.id===asset);
  const submit = () => {
    onSubmit && onSubmit({asset:a, who, due, purpose});
    onClose();
    toast(`${a ? a.id : 'Asset'} checked out to ${who.split(' ')[0]} · due in ${due}`);
  };
  return (
    <Modal open onClose={onClose} title="Check out asset" sub="Opens a loan record · the return gate scan closes it automatically"
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}><Icon n="qr" s={12}/>Check out</button></>}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--brand-soft)', borderRadius:7, fontSize:11.5, color:'var(--text-2)'}}>
        <Icon n="radar" s={16} c="var(--brand-strong)"/>
        <span><b style={{color:'var(--text)'}}>At a crib gate?</b> Scanning the tag + badge fills this form automatically. Manual entry below.</span>
      </div>
      <Field label="Asset" req type="select" value={asset} onChange={setAsset}
        options={avail.map(x=>({v:x.id, l:`${x.name} · ${x.id}`}))}/>
      <FieldRow>
        <Field label="Borrower" req type="select" value={who} onChange={setWho} options={KFA_PEOPLE}/>
        <Field label="Due back" req type="select" value={due} onChange={setDue}
          options={['1 day','3 days','7 days','14 days','30 days']} hint="Defaults: tools 7d · IT loaner 30d"/>
      </FieldRow>
      <Field label="Purpose (optional)" value={purpose} onChange={setPurpose} placeholder="e.g. client site survey, repair job WO-2410-091…"/>
      <div style={{fontSize:10.5, color:'var(--text-3)', lineHeight:1.5}}>
        Reminders are sent before the due date. Overdue items notify the borrower and their manager. Safety-critical items require a passing pre-use inspection.
      </div>
    </Modal>
  );
}

/* === 3. NEW RESERVATION === */
function ReservationModal({open, onClose, toast, onSubmit}){
  const { Modal, Field, FieldRow, Icon, ASSETS } = window;
  const [asset, setAsset] = React.useState(ASSETS ? ASSETS[3].id : '');
  const [who, setWho] = React.useState(KFA_PEOPLE[2]);
  const [when, setWhen] = React.useState('Tomorrow 08:00');
  const [dur, setDur] = React.useState('Full day');
  if (!open) return null;
  const a = (ASSETS||[]).find(x=>x.id===asset);
  const submit = () => {
    onSubmit && onSubmit({asset:a, who, when, dur});
    onClose();
    toast(`Reserved · ${a ? a.name : ''} · ${when}`);
  };
  return (
    <Modal open onClose={onClose} title="New reservation" sub="Book a shared asset ahead of time · prevents double-booking"
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}><Icon n="cal" s={12}/>Reserve</button></>}>
      <Field label="Asset" req type="select" value={asset} onChange={setAsset}
        options={(ASSETS||[]).map(x=>({v:x.id, l:`${x.name} · ${x.id}`}))}/>
      <FieldRow>
        <Field label="Reserved by" req type="select" value={who} onChange={setWho} options={[...KFA_PEOPLE,'Survey Team','HR Training','Facilities']}/>
        <Field label="Start" req type="select" value={when} onChange={setWhen}
          options={['Today 13:00','Tomorrow 08:00','Tomorrow 13:00','Thu 09:00','Fri 09:00','Fri 13:00','Mon 08:00']}/>
      </FieldRow>
      <Field label="Duration" type="select" value={dur} onChange={setDur} options={['2 hours','4 hours','Full day','2 days','1 week']}/>
      <div style={{fontSize:10.5, color:'var(--text-3)'}}>The reservation converts to a loan automatically on the pickup gate scan.</div>
    </Modal>
  );
}

/* === 4. NEW TRANSFER === */
function TransferModal({open, onClose, toast, onSubmit}){
  const { Modal, Field, FieldRow, Icon, ASSETS } = window;
  const [asset, setAsset] = React.useState(ASSETS ? ASSETS[0].id : '');
  const [to, setTo] = React.useState(KFA_LOCATIONS[5]);
  const [cust, setCust] = React.useState(KFA_PEOPLE[1]);
  const [reason, setReason] = React.useState('');
  if (!open) return null;
  const a = (ASSETS||[]).find(x=>x.id===asset);
  const submit = () => {
    onSubmit && onSubmit({asset:a, to, cust, reason});
    onClose();
    toast(`Transfer created · ${a ? a.id : ''} → ${to}`);
  };
  return (
    <Modal open onClose={onClose} title="New transfer" sub="Dispatched → in transit → received · the destination gate scan confirms receipt"
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}><Icon n="swap" s={12}/>Create transfer</button></>}>
      <Field label="Asset" req type="select" value={asset} onChange={setAsset}
        options={(ASSETS||[]).map(x=>({v:x.id, l:`${x.name} · ${x.id}`}))}
        hint="For batches: multi-select rows in the Asset Register, then choose Bulk transfer"/>
      <FieldRow>
        <Field label="From">
          <input className="input" value={a ? a.loc : ''} disabled style={{width:'100%', opacity:.65}}/>
        </Field>
        <Field label="To location" req type="select" value={to} onChange={setTo} options={KFA_LOCATIONS}/>
      </FieldRow>
      <FieldRow>
        <Field label="New custodian" type="select" value={cust} onChange={setCust} options={KFA_PEOPLE}/>
        <Field label="Reason" value={reason} onChange={setReason} placeholder="e.g. team relocation, project assignment…"/>
      </FieldRow>
      <div style={{fontSize:10.5, color:'var(--text-3)', lineHeight:1.5}}>
        Moves within the same cost center are auto-approved. Cross-cost-center transfers route to the PIC + Finance. A move work order is created for the crew automatically.
      </div>
    </Modal>
  );
}

/* === 5. TRANSFER HISTORY === */
function TransferHistoryModal({open, onClose}){
  const { Modal, Icon } = window;
  if (!open) return null;
  const rows = [
    {id:'MUT-2410-0135', n:'12× Dell Monitors',      from:'JKT-HQ · F12', to:'BDG-Office',    when:'2 days ago',  by:'Citra W.'},
    {id:'MUT-2410-0134', n:'Mettler Balance',         from:'JKT-Lab',      to:'BDG-Lab',       when:'4 days ago',  by:'Dr. Ratna'},
    {id:'MUT-2410-0131', n:'6× Aeron Chairs',         from:'Lobby storage',to:'JKT-HQ · F8',  when:'1 week ago',  by:'Facilities'},
    {id:'MUT-2410-0128', n:'Hilti Drill TL-0142',     from:'JKT-WS',       to:'JKT-Workshop',  when:'1 week ago',  by:'Andi P.'},
    {id:'MUT-2410-0124', n:'PowerEdge R760 Server',  from:'JKT-DC · A-04',to:'JKT-DC · B-12', when:'2 weeks ago', by:'IT Ops'},
    {id:'MUT-2410-0119', n:'Forklift VH-FK-0041',     from:'BDG-WH · Bay 1',to:'BDG-WH · Bay 2',when:'3 weeks ago',by:'Andi P.'},
  ];
  return (
    <Modal open wide onClose={onClose} title="Transfer history · last 30 days" sub="All completed transfers · receipt confirmed by destination gate scan"
      footer={<button className="btn" onClick={onClose}>Close</button>}>
      <table className="tbl">
        <thead><tr><th>Transfer</th><th>Route</th><th>Completed</th><th>By</th></tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td><div style={{fontWeight:600, fontSize:12}}>{r.n}</div><div className="asset-id">{r.id}</div></td>
              <td style={{fontSize:11.5, color:'var(--text-2)'}}>{r.from} <Icon n="chev" s={9}/> <b style={{color:'var(--text)'}}>{r.to}</b></td>
              <td style={{fontSize:11.5, color:'var(--text-3)'}}>{r.when}</td>
              <td style={{fontSize:11.5}}>{r.by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}

/* === 6. NEW WORK ORDER === */
function WorkOrderModal({open, onClose, toast, onSubmit}){
  const { Modal, Field, FieldRow, Icon, ASSETS } = window;
  const [asset, setAsset] = React.useState(ASSETS ? ASSETS[7].id : '');
  const [src, setSrc] = React.useState('Corrective · breakdown / damage report');
  const [pr, setPr] = React.useState('High');
  const [issue, setIssue] = React.useState('');
  const [tech, setTech] = React.useState('Andi Pratama');
  if (!open) return null;
  const a = (ASSETS||[]).find(x=>x.id===asset);
  const submit = () => {
    if (!issue.trim()){ toast('Describe the issue first'); return; }
    onSubmit && onSubmit({asset:a, src, pr, issue, tech});
    onClose();
    toast(`Work order created · ${a ? a.id : ''} · assigned to ${tech.split(' ')[0]}`);
  };
  return (
    <Modal open onClose={onClose} title="Create work order" sub="The technician closes it with an RFID scan at the asset's location"
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}><Icon n="wrench" s={12}/>Create WO</button></>}>
      <Field label="Asset" req type="select" value={asset} onChange={setAsset}
        options={(ASSETS||[]).map(x=>({v:x.id, l:`${x.name} · ${x.id}`}))}/>
      <FieldRow>
        <Field label="Source" req type="select" value={src} onChange={setSrc}
          options={['Corrective · breakdown / damage report','PM · scheduled maintenance','Inspection · pre-use check failed','Transfer · move request','Disposal · pickup & scan-out','Audit · variance investigation']}/>
        <Field label="Priority" type="select" value={pr} onChange={setPr} options={['Critical','High','Medium','Low']}/>
      </FieldRow>
      <Field label="Issue description" req type="textarea" value={issue} onChange={setIssue}
        placeholder="What's wrong, what needs to happen, any parts needed…"/>
      <Field label="Assign to" type="select" value={tech} onChange={setTech}
        options={['Andi Pratama','Galang Tirta','Eko Pranata','IT Ops','Med Engineering','Facilities','Auto-dispatch vendor']}/>
    </Modal>
  );
}

/* === 7. EDIT ASSET === */
function EditAssetModal({open, onClose, toast, asset}){
  const { Modal, Field, FieldRow, Icon } = window;
  const [name, setName] = React.useState(asset ? asset.name : '');
  const [cust, setCust] = React.useState(asset ? asset.custodian : KFA_PEOPLE[0]);
  const [loc, setLoc] = React.useState(asset ? asset.loc : KFA_LOCATIONS[0]);
  const [status, setStatus] = React.useState(asset ? asset.status : 'deployed');
  React.useEffect(()=>{ if(asset){ setName(asset.name); setCust(asset.custodian); setLoc(asset.loc); setStatus(asset.status); } }, [asset, open]);
  if (!open || !asset) return null;
  return (
    <Modal open onClose={onClose} title={`Edit asset · ${asset.id}`} sub="Changes are versioned in the audit log"
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>{ onClose(); toast(`Asset updated · ${asset.id}`); }}><Icon n="check" s={12}/>Save changes</button></>}>
      <Field label="Asset name" req value={name} onChange={setName}/>
      <FieldRow>
        <Field label="Custodian" type="select" value={cust} onChange={setCust} options={[...new Set([cust, ...KFA_PEOPLE])]}/>
        <Field label="Location" type="select" value={loc} onChange={setLoc} options={[...new Set([loc, ...KFA_LOCATIONS])]}/>
      </FieldRow>
      <FieldRow>
        <Field label="Status" type="select" value={status} onChange={setStatus}
          options={[{v:'deployed',l:'Deployed'},{v:'in-service',l:'In Service'},{v:'checked-out',l:'Checked Out'},{v:'maint',l:'Maintenance'},{v:'idle',l:'Idle'},{v:'retired',l:'Retired'}]}/>
        <Field label="Serial number">
          <input className="input" value={asset.serial} disabled style={{width:'100%', opacity:.65}}/>
        </Field>
      </FieldRow>
      <div style={{fontSize:10.5, color:'var(--text-3)'}}>EPC <span className="mono">{asset.epc}</span> is locked to this asset. Re-tag via RFID Tags → Print if the physical tag is damaged.</div>
    </Modal>
  );
}

/* === 8. LOCATE ASSET === */
function LocateAssetModal({open, onClose, toast, navigate}){
  const { Modal, Icon, ASSETS, catIcon, catTone } = window;
  const [q, setQ] = React.useState('');
  if (!open) return null;
  const results = (ASSETS||[]).filter(a => !q || (a.name+a.id+a.epc+a.loc).toLowerCase().includes(q.toLowerCase())).slice(0,6);
  return (
    <Modal open onClose={onClose} title="Locate asset" sub="Search by name, asset ID, or EPC · live position from gate + anchor reads"
      footer={<button className="btn" onClick={onClose}>Close</button>}>
      <div className="tb-search" style={{height:38}}>
        <Icon n="search" s={14}/>
        <input autoFocus placeholder="e.g. IT-LP-9847 or MacBook…" value={q} onChange={e=>setQ(e.target.value)} style={{fontSize:13}}/>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:5}}>
        {results.map((a,i)=>(
          <div key={a.id} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 11px', background:'var(--surface-2)', borderRadius:7}}>
            <div className={`ico ${catTone[a.cat]}`} style={{width:28, height:28, borderRadius:6}}><Icon n={catIcon[a.cat]} s={12}/></div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.name}</div>
              <div className="asset-id">{a.id} · {a.loc} · last ping 2m</div>
            </div>
            <button className="btn btn-sm" onClick={()=>{ onClose(); toast(`Showing ${a.id} on the live map`); }}><Icon n="pin" s={11}/>Map</button>
            <button className="btn btn-sm btn-primary" onClick={()=>{ onClose(); navigate && navigate('detail', {assetId:a.id}); }}>Profile</button>
          </div>
        ))}
        {results.length === 0 && <div style={{textAlign:'center', color:'var(--text-3)', fontSize:12, padding:14}}>No assets match “{q}”</div>}
      </div>
    </Modal>
  );
}

/* === 9. NEW EPC RANGE === */
function EpcRangeModal({open, onClose, toast}){
  const { Modal, Field, FieldRow, Icon } = window;
  const [cat, setCat] = React.useState('IT Equipment');
  const [prefix, setPrefix] = React.useState('8990012');
  const [max, setMax] = React.useState('65536');
  const [enc, setEnc] = React.useState('GS1 SGTIN-96');
  if (!open) return null;
  const code = {'IT Equipment':'IT','Tools':'TL','Furniture':'FU','Vehicles':'VH','Lab Instruments':'LB','Medical Devices':'MD','Industrial Machinery':'MC'}[cat] || 'XX';
  return (
    <Modal open onClose={onClose} title="Register EPC range" sub="Only whitelisted EPC patterns can be encoded by the print stations"
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>{ onClose(); toast(`EPC range registered · E280-1170-XXXX-${code}-####`); }}><Icon n="check" s={12}/>Register range</button></>}>
      <FieldRow>
        <Field label="Category" req type="select" value={cat} onChange={setCat}
          options={['IT Equipment','Tools','Furniture','Vehicles','Lab Instruments','Medical Devices','Industrial Machinery']}/>
        <Field label="GS1 company prefix" req value={prefix} onChange={setPrefix} hint="From your GS1 membership"/>
      </FieldRow>
      <FieldRow>
        <Field label="Max allocation" type="number" value={max} onChange={setMax}/>
        <Field label="Encoding" type="select" value={enc} onChange={setEnc} options={['GS1 SGTIN-96','ISO 17363','Custom 96-bit']}/>
      </FieldRow>
      <div style={{padding:'10px 12px', background:'var(--surface-2)', borderRadius:7}}>
        <div style={{fontSize:9.5, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:600}}>Pattern preview</div>
        <div className="mono" style={{fontSize:14, fontWeight:600, color:'var(--brand-strong)', marginTop:3}}>E280-1170-XXXX-{code}-####</div>
      </div>
    </Modal>
  );
}

/* === 10. ORDER TAG STOCK === */
function OrderStockModal({open, onClose, toast}){
  const { Modal, Field, FieldRow, Icon } = window;
  const types = [
    {t:'Confidex Survivor (anti-metal)', vendor:'PT. Confidex ID', cost:28000},
    {t:'Confidex Carrier (anti-metal)',  vendor:'PT. Confidex ID', cost:32000},
    {t:'Avery RF600 soft inlay',          vendor:'PT. Avery Indonesia', cost:4000},
    {t:'HID IronStor (industrial)',       vendor:'PT. HID Global', cost:84000},
    {t:'SATO IT80 (autoclave-safe)',      vendor:'PT. SATO Indonesia', cost:48000},
  ];
  const [type, setType] = React.useState(types[0].t);
  const [qty, setQty] = React.useState('1000');
  if (!open) return null;
  const t = types.find(x=>x.t===type);
  const total = (Number(qty)||0) * (t ? t.cost : 0);
  return (
    <Modal open onClose={onClose} title="Order tag stock" sub="Creates a purchase order with the mapped tag vendor"
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>{ onClose(); toast(`PO drafted · ${Number(qty).toLocaleString()}× ${type.split(' (')[0]} · ${window.formatIDRShort(total)}`); }}><Icon n="check" s={12}/>Create PO</button></>}>
      <Field label="Tag type" req type="select" value={type} onChange={setType} options={types.map(x=>x.t)}/>
      <FieldRow>
        <Field label="Quantity" req type="number" value={qty} onChange={setQty}/>
        <Field label="Vendor">
          <input className="input" value={t ? t.vendor : ''} disabled style={{width:'100%', opacity:.65}}/>
        </Field>
      </FieldRow>
      <div style={{display:'flex', justifyContent:'space-between', padding:'10px 12px', background:'var(--surface-2)', borderRadius:7, fontSize:12}}>
        <span style={{color:'var(--text-2)'}}>Estimated total ({t ? window.formatIDRShort(t.cost) : '—'}/tag)</span>
        <b className="mono" style={{color:'var(--cyan)'}}>{window.formatIDRShort(total)}</b>
      </div>
    </Modal>
  );
}

/* === 11. NEW PM / REMINDER RULE === */
function PmRuleModal({open, onClose, toast}){
  const { Modal, Field, FieldRow, Icon } = window;
  const [name, setName] = React.useState('');
  const [trigger, setTrigger] = React.useState('Time interval');
  const [interval_, setInterval_] = React.useState('180 days');
  const [remind, setRemind] = React.useState('14d · 7d · 1d');
  const [assign, setAssign] = React.useState('Maintenance Team');
  if (!open) return null;
  const submit = () => {
    if (!name.trim()){ toast('Rule name is required'); return; }
    onClose();
    toast(`Rule created · "${name}" · auto-WO enabled`);
  };
  return (
    <Modal open onClose={onClose} title="New reminder rule" sub="Auto-creates work orders and sends reminders on the configured trigger"
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}><Icon n="check" s={12}/>Create rule</button></>}>
      <Field label="Rule name" req value={name} onChange={setName} placeholder="e.g. Generator monthly load test"/>
      <FieldRow>
        <Field label="Trigger type" type="select" value={trigger} onChange={setTrigger}
          options={['Time interval','Usage · cycles','Usage · run-hours','Odometer / km','Warranty expiry','Insurance expiry']}/>
        <Field label="Interval" type="select" value={interval_} onChange={setInterval_}
          options={['30 days','90 days','180 days','365 days','500 cycles','1,000 run-hours','5,000 km']}/>
      </FieldRow>
      <FieldRow>
        <Field label="Remind at" value={remind} onChange={setRemind} hint="Lead times before due, separated by ·"/>
        <Field label="Assign to" type="select" value={assign} onChange={setAssign}
          options={['Maintenance Team','IT Helpdesk','Lab Manager','Med Engineering','Safety Officer','Facilities','Auto-dispatch vendor']}/>
      </FieldRow>
    </Modal>
  );
}

Object.assign(window, {
  DisposalRequestModal, CheckOutModal, ReservationModal, TransferModal,
  TransferHistoryModal, WorkOrderModal, EditAssetModal, LocateAssetModal,
  EpcRangeModal, OrderStockModal, PmRuleModal,
});
