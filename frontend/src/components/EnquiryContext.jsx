import { createContext, useCallback, useContext, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { EnquiryForm } from "./EnquiryForm";

const Ctx = createContext({ openEnquiry: () => {} });
export const useEnquiry = () => useContext(Ctx);

export const EnquiryProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, product: "", key: 0 });
  const openEnquiry = useCallback((product = "") => setState((s) => ({ open: true, product, key: s.key + 1 })), []);
  const close = () => setState((s) => ({ ...s, open: false }));
  return (
    <Ctx.Provider value={{ openEnquiry }}>
      {children}
      <Dialog open={state.open} onOpenChange={(o) => !o && close()}>
        <DialogContent
          data-lenis-prevent
          className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto rounded-[28px] border-0 bg-brand-base p-6 shadow-neu-lg sm:p-9"
          data-testid="enquiry-modal"
        >
          <p className="eyebrow">Product enquiry</p>
          <DialogTitle className="font-display text-3xl font-extrabold uppercase leading-none">Request an enquiry</DialogTitle>
          <DialogDescription className="text-sm text-brand-grey">
            {state.product ? (
              <>Product: <b className="text-brand-ink" data-testid="enquiry-selected-product">{state.product}</b></>
            ) : (
              "Tell us what you ship and we will help you specify the right material and quantity."
            )}
          </DialogDescription>
          <div className="mt-2">
            <EnquiryForm key={state.key} product={state.product} onDone={close} />
          </div>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
};
