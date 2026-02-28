"use client";

import { useTranslations } from "next-intl";
import { MessageSquarePlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertTextAtCursor } from "@/lib/textarea-utils";

interface ExpressionsDrawerProps {
  taskNumber: number;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

interface ExpressionItem {
  fr: string;
  note: string; // short description in user locale
}

// ── Expressions data by task × category ──────────────────────────

const EXPRESSIONS: Record<number, Record<string, ExpressionItem[]>> = {
  1: {
    greeting: [
      { fr: "Cher/Chère ...,", note: "greeting.dear" },
      { fr: "Bonjour ...,", note: "greeting.hello" },
      { fr: "Madame, Monsieur,", note: "greeting.formal" },
    ],
    opening: [
      { fr: "Je vous écris pour ", note: "opening.writeTo" },
      { fr: "Je me permets de vous contacter pour ", note: "opening.contactFor" },
      { fr: "Suite à votre annonce, ", note: "opening.followingAd" },
      { fr: "Je souhaiterais ", note: "opening.wouldLike" },
    ],
    connector: [
      { fr: "De plus, ", note: "connector.moreover" },
      { fr: "En effet, ", note: "connector.indeed" },
      { fr: "Par ailleurs, ", note: "connector.furthermore" },
      { fr: "C'est pourquoi ", note: "connector.thatIsWhy" },
    ],
    closing: [
      { fr: "Je vous remercie d'avance.", note: "closing.thankYou" },
      { fr: "Dans l'attente de votre réponse, ", note: "closing.awaitReply" },
      { fr: "Cordialement,", note: "closing.regards" },
      { fr: "Amicalement,", note: "closing.friendly" },
      { fr: "À bientôt,", note: "closing.seeYou" },
    ],
  },
  2: {
    opening: [
      { fr: "J'aimerais vous parler de ", note: "opening.talkAbout" },
      { fr: "Il y a quelques jours, ", note: "opening.fewDaysAgo" },
      { fr: "Récemment, j'ai eu l'occasion de ", note: "opening.recently" },
      { fr: "C'est un sujet qui me tient à cœur.", note: "opening.heartfelt" },
    ],
    opinion: [
      { fr: "À mon avis, ", note: "opinion.inMyOpinion" },
      { fr: "Je considère que ", note: "opinion.iConsider" },
      { fr: "Il me semble que ", note: "opinion.itSeemsToMe" },
      { fr: "Je suis convaincu(e) que ", note: "opinion.convinced" },
      { fr: "Personnellement, je pense que ", note: "opinion.personally" },
    ],
    connector: [
      { fr: "Cependant, ", note: "connector.however" },
      { fr: "En revanche, ", note: "connector.onTheOtherHand" },
      { fr: "D'une part... d'autre part, ", note: "connector.onOneHand" },
      { fr: "En effet, ", note: "connector.indeed" },
      { fr: "Par exemple, ", note: "connector.forExample" },
      { fr: "Malgré cela, ", note: "connector.despite" },
    ],
    closing: [
      { fr: "En conclusion, ", note: "closing.inConclusion" },
      { fr: "Pour toutes ces raisons, ", note: "closing.forAllReasons" },
      { fr: "En fin de compte, ", note: "closing.ultimately" },
    ],
  },
  3: {
    opening: [
      { fr: "Les deux documents présentent des points de vue opposés sur ", note: "opening.opposingViews" },
      { fr: "D'après le premier document, ", note: "opening.firstDoc" },
      { fr: "Le second document affirme que ", note: "opening.secondDoc" },
      { fr: "Selon l'auteur, ", note: "opening.accordingTo" },
    ],
    connector: [
      { fr: "Néanmoins, ", note: "connector.nevertheless" },
      { fr: "Toutefois, ", note: "connector.nonetheless" },
      { fr: "Par conséquent, ", note: "connector.consequently" },
      { fr: "En ce qui concerne ", note: "connector.regarding" },
      { fr: "Force est de constater que ", note: "connector.mustNote" },
      { fr: "Il est indéniable que ", note: "connector.undeniable" },
    ],
    opinion: [
      { fr: "Quant à moi, je soutiens que ", note: "opinion.iMaintain" },
      { fr: "Il est évident que ", note: "opinion.obvious" },
      { fr: "On ne peut nier que ", note: "opinion.cannotDeny" },
      { fr: "Il convient de souligner que ", note: "opinion.worthNoting" },
    ],
    closing: [
      { fr: "En somme, ", note: "closing.inSummary" },
      { fr: "Pour conclure, ", note: "closing.toSum" },
      { fr: "Tout compte fait, ", note: "closing.allConsidered" },
    ],
  },
};

const CATEGORY_ORDER: Record<number, string[]> = {
  1: ["greeting", "opening", "connector", "closing"],
  2: ["opening", "opinion", "connector", "closing"],
  3: ["opening", "connector", "opinion", "closing"],
};

export function ExpressionsDrawer({ taskNumber, textareaRef }: ExpressionsDrawerProps) {
  const t = useTranslations("expressionsDrawer");

  const tn = Math.min(Math.max(taskNumber, 1), 3) as 1 | 2 | 3;
  const categories = CATEGORY_ORDER[tn];
  const data = EXPRESSIONS[tn];
  const defaultTab = categories[0];

  const handleInsert = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    // Small delay to ensure focus is established before inserting
    requestAnimationFrame(() => {
      insertTextAtCursor(textarea, text);
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <MessageSquarePlus className="h-3.5 w-3.5" />
          {t("trigger")}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[340px] sm:w-[380px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">{t("title")}</SheetTitle>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </SheetHeader>

        <Tabs defaultValue={defaultTab} className="mt-4">
          <TabsList className="w-full">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="flex-1 text-xs">
                {t(`categories.${cat}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-3 space-y-1.5">
              {data[cat]?.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleInsert(item.fr)}
                  className="flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted/70 active:bg-muted"
                >
                  <span className="flex-1">
                    <span className="font-medium text-foreground">{item.fr}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {t(`notes.${item.note}`)}
                    </span>
                  </span>
                </button>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
