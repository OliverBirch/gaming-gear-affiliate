"use client";

import { useState, useEffect } from "react";
import type { Mouse, Esport, Pro } from "@/lib/types";
import { MouseCard } from "@/components/mouse-card";
import { useParams } from "next/navigation";
import { getEsport } from "@/data/esports";
import { getMiceByPro } from "@/data/mice";
import { getMiceByEsport } from "@/data/mice";
import { getProsByEsport } from "@/data/pros";

export default function EsportPage() {
  const params = useParams();
  const esportSlug = params.esport as string;
  
  const esport = getEsport(esportSlug);
  const pros = getProsByEsport(esportSlug);
  const mice = getMiceByEsport(esportSlug);
  
  if (!esport) {
    return <div>Esport ikke fundet</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {esport.navn} - Hvilken mus bruger pros?
        </h1>
        <p className="text-muted-foreground">
          {esport.beskrivelse}
        </p>
      </div>

      <div className="grid gap-6 mb-12">
        {pros.length > 0 ? (
          pros.map((pro) => {
            const mouse = getMiceByPro(pro.slug);
            if (!mouse || mouse.length === 0) return null;
            
            return (
              <div key={pro.slug} className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold">
                    {pro.navn.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{pro.navn}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pro.hold} · {pro.settings.dpi} DPI · {pro.settings.edpi} eDPI
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {mouse[0].navn}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <MouseCard mouse={mouse[0]} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Ingen pro-indstillinger tilgængelige for dette esporm endnu.</p>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Mest brugte mus i {esport.navn}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mice.map((mouse) => (
            <MouseCard key={mouse.slug} mouse={mouse} />
          ))}
        </div>
      </div>
    </div>
  );
}
