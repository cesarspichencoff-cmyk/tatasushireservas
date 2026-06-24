'use client';

/* =====================================================================
   Plaquinha de mesa com QR — arte pronta para imprimir (tamanho pequeno,
   ~A6/table-tent) ou baixar como imagem. A pessoa senta, vê a plaquinha,
   aponta a câmera e avalia o prato do dia.
   ===================================================================== */

import { useEffect } from 'react';
import { QrCode } from '@/components/QrCode';
import { Botao } from '@/components/ui';
import { Icone } from '@/components/Icones';

export function PlaquinhaQR({
  aberto,
  aoFechar,
  url,
}: {
  aberto: boolean;
  aoFechar: () => void;
  url: string;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aoFechar]);

  if (!aberto) return null;

  const baixarImagem = async () => {
    try {
      const L = 720;
      const A = 1180;
      const c = document.createElement('canvas');
      c.width = L;
      c.height = A;
      const ctx = c.getContext('2d');
      if (!ctx) return;

      const rrect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
        else ctx.rect(x, y, w, h);
      };

      const g = ctx.createLinearGradient(0, 0, 0, A);
      g.addColorStop(0, '#055d2f');
      g.addColorStop(1, '#064c29');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, L, A);
      ctx.fillStyle = '#c8a96b';
      ctx.fillRect(0, 0, L, 14);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 70px Georgia, serif';
      ctx.fillText('TATÁ HOUSE', L / 2, 150);
      ctx.fillStyle = '#dcc492';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('REFEITÓRIO DO TATÁ SUSHI', L / 2, 190);

      // Separador dourado
      const sepG = ctx.createLinearGradient(160, 0, L - 160, 0);
      sepG.addColorStop(0, 'rgba(200,169,107,0)');
      sepG.addColorStop(0.5, 'rgba(200,169,107,0.8)');
      sepG.addColorStop(1, 'rgba(200,169,107,0)');
      ctx.fillStyle = sepG;
      ctx.fillRect(160, 218, L - 320, 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 56px Georgia, serif';
      ctx.fillText('AVALIE O PRATO', L / 2, 310);
      ctx.fillText('DO DIA', L / 2, 374);
      ctx.fillStyle = '#c9f5da';
      ctx.font = '500 26px sans-serif';
      ctx.fillText('Aponte a câmera e diga o que achou', L / 2, 428);

      const qr = new Image();
      qr.crossOrigin = 'anonymous';
      await new Promise<void>((res, rej) => {
        qr.onload = () => res();
        qr.onerror = () => rej(new Error('qr'));
        qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=460x460&margin=2&data=${encodeURIComponent(url)}`;
      });
      const s = 460;
      const qx = (L - s) / 2;
      const qy = 472;
      const pad = 28;
      // Sombra do cartão
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      rrect(qx - pad + 5, qy - pad + 8, s + pad * 2, s + pad * 2, 28); ctx.fill();
      // Cartão branco com cantos arredondados
      ctx.fillStyle = '#ffffff';
      rrect(qx - pad, qy - pad, s + pad * 2, s + pad * 2, 28); ctx.fill();
      ctx.drawImage(qr, qx, qy, s, s);

      // Chips de avaliação com cor
      const chipOpcoes = [
        { e: '😋', r: 'Adorei', bg: 'rgba(16,185,129,0.22)', border: 'rgba(16,185,129,0.5)' },
        { e: '😐', r: 'Ok', bg: 'rgba(255,255,255,0.10)', border: 'rgba(255,255,255,0.2)' },
        { e: '👎', r: 'Não curti', bg: 'rgba(248,113,113,0.18)', border: 'rgba(248,113,113,0.4)' },
      ];
      const chipGap = 10;
      const chipW = (L - 80 - chipGap * 2) / 3;
      const chipH = 116;
      const chipY = qy + s + pad + 24;
      chipOpcoes.forEach((o, i) => {
        const chipX = 40 + i * (chipW + chipGap);
        const cx = chipX + chipW / 2;
        // Fundo colorido
        ctx.fillStyle = o.bg;
        rrect(chipX, chipY, chipW, chipH, 18); ctx.fill();
        // Borda colorida
        ctx.strokeStyle = o.border;
        ctx.lineWidth = 1.5;
        rrect(chipX, chipY, chipW, chipH, 18); ctx.stroke();
        // Emoji
        ctx.fillStyle = '#ffffff';
        ctx.font = '40px sans-serif';
        ctx.fillText(o.e, cx, chipY + 54);
        // Rótulo
        ctx.fillStyle = '#c9f5da';
        ctx.font = 'bold 19px sans-serif';
        ctx.fillText(o.r.toUpperCase(), cx, chipY + 90);
      });

      // Rodapé
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('SUA OPINIÃO TRANSFORMA O CARDÁPIO', L / 2, A - 20);

      const a = document.createElement('a');
      a.href = c.toDataURL('image/png');
      a.download = 'plaquinha-tata-house.png';
      a.click();
    } catch {
      alert('Não consegui baixar a imagem aqui. Use “Imprimir” e escolha “Salvar como PDF”.');
    }
  };

  return (
    <div className="min-h-screen bg-carvao-200 py-6 dark:bg-carvao-950 print:bg-white print:py-0">
      {/* Controles (somem na impressão) */}
      <div className="mx-auto mb-4 flex max-w-[120mm] flex-wrap items-center justify-between gap-2 px-4 print:hidden">
        <button
          onClick={aoFechar}
          className="text-sm font-bold uppercase tracking-wide text-carvao-500 hover:text-carvao-800 dark:text-areia-200"
        >
          ← Voltar
        </button>
        <div className="flex items-center gap-2">
          <Botao variante="secundario" onClick={baixarImagem} className="!min-h-10 !px-4 !py-2 text-sm">
            <Icone nome="imagem" tam={16} /> Baixar imagem
          </Botao>
          <Botao variante="sucesso" onClick={() => window.print()} className="!min-h-10 !px-5 !py-2 text-sm">
            <Icone nome="exportar" tam={16} /> Imprimir
          </Botao>
        </div>
      </div>

      {/* A plaquinha (table-tent) */}
      <div className="poster mx-auto flex w-[92mm] flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-b from-brand-800 to-brand-900 text-center text-white shadow-flutuante print:rounded-none print:shadow-none">
        {/* Régua dourada no topo */}
        <div className="h-2 w-full bg-gradient-to-r from-ouro-500 via-ouro-300 to-ouro-500" />
        <div className="flex w-full flex-col items-center gap-5 px-7 pb-9 pt-8">
          <div>
            <div className="font-display text-3xl font-black tracking-[0.12em]">TATÁ HOUSE</div>
            <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.3em] text-ouro-300">
              Refeitório do Tatá Sushi
            </div>
          </div>

          <div className="h-px w-2/3 rounded-full bg-gradient-to-r from-transparent via-ouro-400/60 to-transparent" aria-hidden />

          <div>
            <div className="font-display text-[28px] font-black leading-tight tracking-tight">
              Avalie o prato
              <br />
              do dia
            </div>
            <p className="mt-2 text-sm font-medium text-brand-100">Aponte a câmera e diga o que achou</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-[0_8px_40px_rgba(0,0,0,0.45)] ring-4 ring-white/10">
            <QrCode url={url} size={200} />
          </div>

          {/* Escala de avaliação com rótulos — cores diferenciam intenção */}
          <div className="flex w-full items-stretch justify-center gap-2">
            {[
              { e: '😋', r: 'Adorei', cls: 'bg-emerald-400/20 ring-1 ring-emerald-300/40' },
              { e: '😐', r: 'Ok', cls: 'bg-white/10 ring-1 ring-white/15' },
              { e: '👎', r: 'Não curti', cls: 'bg-red-400/15 ring-1 ring-red-300/25' },
            ].map((o) => (
              <div key={o.r} className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 ${o.cls}`}>
                <span className="text-2xl leading-none">{o.e}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand-100">{o.r}</span>
              </div>
            ))}
          </div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
            Sua opinião transforma o cardápio
          </p>
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-[120mm] px-4 text-center text-xs text-texto-suave print:hidden">
        Dica: imprima, dobre ao meio e deixe na mesa do refeitório. Para PDF, use “Imprimir → Salvar como PDF”.
      </p>
    </div>
  );
}
