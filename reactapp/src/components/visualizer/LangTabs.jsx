import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Code } from "lucide-react";

/**
 * LangTabs — C++ / Python / Java code tabs.
 *
 * Uses shadcn Tabs for a clean, professional tab bar.
 */
const LangTabs = ({
  langs = [],
  activeLang: controlledLang,
  onLangChange,
  renderCode,
}) => {
  const [internalLang, setInternalLang] = useState(langs[0]?.lang ?? "");
  const activeLang = controlledLang ?? internalLang;
  const handleChange = (lang) => {
    onLangChange ? onLangChange(lang) : setInternalLang(lang);
  };

  const activeEntry = langs.find((l) => l.lang === activeLang) ?? langs[0];
  if (!langs.length) return null;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Tabs value={activeLang} onValueChange={handleChange}>
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <Code className="h-3.5 w-3.5 text-muted-foreground" />
          <TabsList className="h-7 bg-transparent p-0 gap-0">
            {langs.map(({ lang, label }) => (
              <TabsTrigger
                key={lang}
                value={lang}
                className="h-7 px-2.5 text-[11px] font-mono rounded-sm data-[state=active]:bg-muted"
              >
                {label ?? lang}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {langs.map(({ lang, code }) => (
          <TabsContent key={lang} value={lang} className="mt-0">
            <div className="p-4 overflow-x-auto text-xs leading-relaxed">
              {renderCode ? (
                renderCode(code ?? "", lang)
              ) : (
                <pre className="font-mono text-foreground/80 whitespace-pre-wrap">
                  {code ?? ""}
                </pre>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LangTabs;
