import React, { useState } from 'react';
import { Smartphone, Printer, Send, ExternalLink, Check, Copy, MessageSquare, Sparkles, Download, Share2, Globe, AlertTriangle } from 'lucide-react';
import { FacultyMember } from '../types';
import { getShareableVipUrl, PUBLIC_APP_URL } from '../config/appConfig';

interface SmsAndPrinterStationProps {
  faculty: FacultyMember | null;
  onOpenVipPass: (faculty: FacultyMember) => void;
  onLogEvent: (category: 'SMS_DISPATCH' | 'PRINTER', message: string, level: 'info' | 'success') => void;
}

export const SmsAndPrinterStation: React.FC<SmsAndPrinterStationProps> = ({
  faculty,
  onOpenVipPass,
  onLogEvent,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  const targetFaculty: FacultyMember = faculty || {
    id: 1,
    name: 'Peta Pradeep Kumar',
    salutation: 'Mr.',
    designation: 'Principal',
    department: 'Administration & Leadership',
    phone: '8897526662',
    photoUrl: '/faculty_photos/page_01.jpg',
    pageIndex: 1,
    status: 'registered',
    customThought: 'Innovating the future through relentless curiosity and educational excellence.',
    vipToken: 'MEDHA-VIP-001',
  };

  // Always use the public shared URL so external people (Renuka, faculty, students) don't get 403
  const vipUrl = getShareableVipUrl(targetFaculty.id, targetFaculty.vipToken);

  const smsText = `MEDHA 2K26 VIP REGISTRATION CONFIRMED!
Dear ${targetFaculty.salutation} ${targetFaculty.name} sir/madam,
You have been successfully registered for Medha 2K26 on October 24th, 2026.
Event details and information have been recorded.
👉 Click here to unlock your VIP Greeting Pass & QR Code:
${vipUrl}
Stay tuned for updates!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(smsText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTriggerRealSms = () => {
    onLogEvent(
      'SMS_DISPATCH',
      `Triggered mobile SMS dispatch to +91 ${targetFaculty.phone} for ${targetFaculty.name}`,
      'success'
    );
    // Standard mobile SMS uri
    const cleanPhone = targetFaculty.phone.replace(/\D/g, '');
    const smsUri = `sms:+91${cleanPhone}?body=${encodeURIComponent(smsText)}`;
    window.location.href = smsUri;
  };

  const handleTriggerWhatsApp = () => {
    onLogEvent(
      'SMS_DISPATCH',
      `Dispatched WhatsApp instant notification to +91 ${targetFaculty.phone}`,
      'success'
    );
    const cleanPhone = targetFaculty.phone.replace(/\D/g, '');
    const waUri = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(
      smsText
    )}`;
    window.open(waUri, '_blank');
  };

  const handlePrintSlip = () => {
    setIsPrinting(true);
    setPrintSuccess(false);

    onLogEvent(
      'PRINTER',
      `Mini Bluetooth printer spooling thermal pass for ${targetFaculty.name} [${targetFaculty.vipToken}]`,
      'info'
    );

    setTimeout(() => {
      setIsPrinting(false);
      setPrintSuccess(true);
      onLogEvent(
        'PRINTER',
        `Thermal slip printed successfully via Bluetooth ESC/POS protocol`,
        'success'
      );
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Public Shareable URL Notice (Fixes 403 Google Error for Renuka & Faculty) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-[#0a1835] to-blue-950/80 border border-cyan-500/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-600/20 border border-cyan-400/40 rounded-xl text-cyan-300 shrink-0 mt-0.5">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Public Share Link (For Renuka, Faculty &amp; Students)</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                NO 403 ERROR
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              To share with Renuka or other faculty, send this link instead of copying the private <code className="text-rose-400">studio.google.com</code> URL:
            </p>
            <div className="text-xs font-mono text-cyan-300 mt-1 break-all select-all bg-black/50 px-2.5 py-1.5 rounded-lg border border-cyan-900/60">
              {vipUrl}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleTriggerWhatsApp}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share to WhatsApp</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Smartphone SMS Dispatch Simulator */}
        <div className="lg:col-span-7 bg-[#091024] border border-cyan-900/50 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-950 border border-blue-700/50 rounded-lg text-blue-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Real-time SMS Integration Dispatcher
                </h3>
                <p className="text-xs text-slate-400">
                  Target: +91 {targetFaculty.phone} · Gateway: MEDHA-TX
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              DISPATCHED
            </span>
          </div>

          {/* Smartphone Chat Bubble Mock */}
          <div className="bg-[#050917] border border-slate-800 rounded-xl p-4 shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pb-2 mb-2 border-b border-slate-800/80">
              <span>SENDER: MEDHA-2K26</span>
              <span>OCT 24, 2026</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {`Dear ${targetFaculty.salutation} ${targetFaculty.name} sir/madam,\nYou have been successfully registered for Medha 2K26!\nEvent on October 24th, 2026. Event details & instructions are confirmed.`}
              </p>

              {/* High-Intent "Click Here" Link Button */}
              <div className="pt-2 space-y-1.5">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.history.pushState({}, '', vipUrl);
                    }
                    onOpenVipPass(targetFaculty);
                  }}
                  className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform"
                >
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  <span>👉 CLICK HERE: UNLOCK VIP GREETING &amp; PASS</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="text-[11px] font-mono text-cyan-300 break-all bg-black/60 p-2 rounded-lg border border-cyan-950 flex items-center justify-between gap-2">
                  <a
                    href={vipUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', vipUrl);
                      onOpenVipPass(targetFaculty);
                    }}
                    className="hover:underline text-cyan-400 truncate"
                  >
                    {vipUrl}
                  </a>
                  <button
                    onClick={handleCopy}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white shrink-0"
                  >
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-1 font-mono">
                Token: <span className="text-cyan-400">{targetFaculty.vipToken}</span> · You will have a text message sent to your mobile phone number.
              </div>
            </div>
          </div>
        </div>

        {/* Live Real-World SMS Dispatch Buttons */}
        <div className="pt-4 border-t border-slate-800/80 mt-4 flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerRealSms}
              className="px-3 py-1.5 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Send via phone SMS app"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Phone SMS</span>
            </button>

            <button
              onClick={handleTriggerWhatsApp}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Send invitation via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp SMS</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* Right: Amazon Mini Bluetooth Thermal Printer Simulator */}
      <div className="lg:col-span-5 bg-[#091024] border border-cyan-900/50 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-cyan-950 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-950 border border-amber-700/50 rounded-lg text-amber-400">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Mini Bluetooth Thermal Printer
                </h3>
                <p className="text-xs text-slate-400">
                  58mm Portable ESC/POS · Bluetooth Connected
                </p>
              </div>
            </div>

            <button
              onClick={handlePrintSlip}
              disabled={isPrinting}
              className="px-3 py-1 text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? 'Printing...' : 'Print Slip'}</span>
            </button>
          </div>

          {/* Physical Thermal Receipt Paper Preview */}
          <div className="relative mx-auto w-full max-w-[280px] bg-white text-slate-900 rounded-sm p-4 font-mono text-[11px] shadow-2xl border-t-8 border-slate-700 rotate-[-0.5deg]">
            <div className="text-center border-b-2 border-dashed border-slate-300 pb-2 mb-2">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-950">
                *** MEDHA 2K26 ***
              </div>
              <div className="text-[10px] text-slate-600">AI &amp; ROBOTICS MEGA FEST</div>
              <div className="text-[9px] text-slate-500">DATE: OCTOBER 24, 2026</div>
            </div>

            <div className="space-y-1.5 py-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">FACULTY:</span>
                <span className="font-bold text-slate-900 truncate max-w-[150px]">
                  {targetFaculty.salutation} {targetFaculty.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ROLE:</span>
                <span className="font-medium text-slate-800">{targetFaculty.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DEPT:</span>
                <span className="font-medium text-slate-800 truncate max-w-[150px]">
                  {targetFaculty.department}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PHONE:</span>
                <span className="font-mono text-slate-800">+91 {targetFaculty.phone}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">STATUS:</span>
                <span className="font-bold text-emerald-700">VIP CONFIRMED</span>
              </div>
            </div>

            {/* Simulated 2D QR Code on Thermal Paper */}
            <div className="my-3 py-2 border-y border-dashed border-slate-300 flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-950 p-2 rounded flex flex-col items-center justify-center text-white">
                <div className="grid grid-cols-4 gap-1 w-16 h-16 bg-white p-1 rounded-sm">
                  <div className="bg-black col-span-2 row-span-2 rounded-xs" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black col-span-2 row-span-2 rounded-xs" />
                  <div className="bg-black" />
                </div>
              </div>
              <div className="text-[9px] text-slate-600 font-mono mt-1">
                TOKEN: {targetFaculty.vipToken}
              </div>
            </div>

            <div className="text-center text-[9px] text-slate-500 border-t border-slate-200 pt-1">
              *** WELCOME TO MEDHA 2K26 ***
              <br />
              Generated by Medha AI Robot
            </div>
          </div>
        </div>

        {printSuccess && (
          <div className="mt-3 p-2 bg-emerald-950/80 border border-emerald-600/80 rounded-lg text-emerald-300 text-xs flex items-center justify-between">
            <span>Pass printed to Bluetooth thermal printer!</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
