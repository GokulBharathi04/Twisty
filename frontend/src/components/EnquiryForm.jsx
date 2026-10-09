import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, Loader2, Paperclip } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : null;
const EMPTY = { full_name: "", company: "", email: "", phone: "", city: "", quantity: "", specification: "", message: "" };

const Field = ({ label, name, required, type = "text", value, onChange, span }) => (
  <label className={`block ${span ? "sm:col-span-2" : ""}`}>
    <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-brand-grey">
      {label} {required && <span className="text-brand">*</span>}
    </span>
    <input className="field" name={name} type={type} required={required} value={value} onChange={onChange} data-testid={`enquiry-${name}-input`} />
  </label>
);

export const EnquiryForm = ({ product = "", onDone }) => {
  const { pathname } = useLocation();
  const [form, setForm] = useState({ ...EMPTY, product });
  const [file, setFile] = useState(null);
  const [state, setState] = useState({ status: "idle", error: "", ref: "" });
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!API) return setState({ status: "error", error: "Enquiries are temporarily unavailable. Please contact us directly." });
    if (file && file.size > 5 * 1024 * 1024) return setState({ status: "error", error: "Attachment must be 5 MB or smaller." });
    setState({ status: "loading", error: "" });
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("source_page", pathname);
    if (file) fd.append("attachment", file);
    try {
      const { data } = await axios.post(`${API}/enquiries`, fd);
      setState({ status: "done", error: "", ref: data?.reference ?? "" });
    } catch (err) {
      const d = err?.response?.data?.detail;
      setState({ status: "error", error: typeof d === "string" ? d : "Please check the required fields and try again." });
    }
  };

  if (state.status === "done")
    return (
      <div className="py-10 text-center" data-testid="enquiry-success">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full neu">
          <CheckCircle2 className="h-9 w-9 text-brand" />
        </div>
        <h3 className="mt-6 text-2xl font-extrabold uppercase">Enquiry received</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-brand-grey">Thank you for your enquiry. Our team will review your requirements and get back to you shortly.</p>
        {state.ref && <p className="mt-4 font-mono text-xs text-brand-grey" data-testid="enquiry-reference">Reference: {state.ref}</p>}
        {onDone && <button className="btn-neu mt-8" onClick={onDone} data-testid="enquiry-close-btn">Close</button>}
      </div>
    );

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="enquiry-form">
      <Field label="Full name" name="full_name" required value={form.full_name} onChange={set} />
      <Field label="Company name" name="company" required value={form.company} onChange={set} />
      <Field label="Email" name="email" type="email" required value={form.email} onChange={set} />
      <Field label="Phone number" name="phone" type="tel" required value={form.phone} onChange={set} />
      <Field label="City / Location" name="city" value={form.city} onChange={set} />
      <Field label="Product" name="product" value={form.product} onChange={set} />
      <Field label="Quantity required" name="quantity" value={form.quantity} onChange={set} />
      <Field label="Preferred specification" name="specification" value={form.specification} onChange={set} />
      <label className="block sm:col-span-2">
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-brand-grey">Message / Requirements</span>
        <textarea className="field min-h-[110px] resize-y" name="message" value={form.message} onChange={set} data-testid="enquiry-message-input" />
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 shadow-neu-in-sm sm:col-span-2" data-testid="enquiry-attachment-label">
        <Paperclip className="h-4 w-4 text-brand" />
        <span className="truncate text-sm text-brand-grey">{file ? file.name : "Attachment (optional) — PDF, image, doc or sheet up to 5 MB"}</span>
        <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-testid="enquiry-attachment-input" />
      </label>
      {state.status === "error" && <p className="text-sm font-semibold text-brand sm:col-span-2" data-testid="enquiry-error">{state.error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" className="btn-red w-full sm:w-auto" disabled={state.status === "loading"} data-testid="enquiry-submit-button">
          {state.status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />} Submit enquiry
        </button>
      </div>
    </form>
  );
};
