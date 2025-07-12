// Fájl: components/course/CoursePlayer.tsx

"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Circle, Lock, ArrowRight, Award, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge'; // <-- JAVÍTÁS: A hiányzó import

// A szerver komponensből kapott adatok típusainak definiálása a kliens oldalon
type Chapter = { _id: string; title: string; type: 'lesson' | 'quiz'; content: string; points: number; };
type Module = { _id: string; title: string; chapters: Chapter[]; };
type Course = { _id: string; title: string; description: string; modules: Module[]; };
type ProgressData = { score: number; completedChapters: string[]; isCompleted: boolean; };

interface CoursePlayerProps {
  initialCourse: Course;
  initialProgress: ProgressData | null;
}

export function CoursePlayer({ initialCourse, initialProgress }: CoursePlayerProps) {
  if (!initialCourse || !initialCourse.modules || initialCourse.modules.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Hiba</CardTitle>
        <CardDescription>A tananyag nem tölthető be. Lehet, hogy nincsenek hozzá modulok vagy fejezetek rendelve.</CardDescription>
      </Card>
    );
  }

  const [activeChapter, setActiveChapter] = useState(initialCourse.modules[0].chapters[0]);
  const [progress, setProgress] = useState(initialProgress);
  const [isLoading, setIsLoading] = useState(false);

  const completedChaptersSet = useMemo(() => new Set(progress?.completedChapters || []), [progress]);

  const totalChapters = useMemo(() => initialCourse.modules.reduce((acc, module) => acc + module.chapters.length, 0), [initialCourse]);
  const courseProgressPercentage = totalChapters > 0 ? (completedChaptersSet.size / totalChapters) * 100 : 0;

  const handleChapterSelect = (chapter: Chapter) => {
    const moduleIndex = initialCourse.modules.findIndex(m => m.chapters.some(c => c._id === chapter._id));
    const chapterIndex = initialCourse.modules[moduleIndex].chapters.findIndex(c => c._id === chapter._id);
    const prevChapter = chapterIndex > 0 ? initialCourse.modules[moduleIndex].chapters[chapterIndex - 1] : (moduleIndex > 0 ? initialCourse.modules[moduleIndex - 1].chapters.at(-1) : null);

    if (!prevChapter || completedChaptersSet.has(prevChapter._id)) {
      setActiveChapter(chapter);
    } else {
      toast.warning("Előbb fejezze be az előző fejezetet!");
    }
  };

  const handleCompleteChapter = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: initialCourse._id,
          chapterId: activeChapter._id,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setProgress(data.progress);
      toast.success(`"${activeChapter.title}" befejezve!`, {
        description: `+${activeChapter.points} pontot szereztél!`,
      });

      const allChapters = initialCourse.modules.flatMap(m => m.chapters);
      const currentIndex = allChapters.findIndex(c => c._id === activeChapter._id);
      if (currentIndex < allChapters.length - 1) {
        setActiveChapter(allChapters[currentIndex + 1]);
      } else {
        toast.info("🎉 Gratulálunk, befejezte a tanfolyamot!", {
            description: `Végső pontszám: ${data.progress.score}`
        });
      }
    } catch (error: any) {
      toast.error("Hiba történt a haladás mentésekor.", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentChapterCompleted = completedChaptersSet.has(activeChapter._id);

  return (
    <div className="grid md:grid-cols-[350px_1fr] gap-8 items-start">
      {/* BAL OLDALI, LENYITHATÓ MODUL-LISTA */}
      <aside>
        <div className="sticky top-24">
          <h2 className="text-xl font-bold">{initialCourse.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">{initialCourse.description}</p>
          
          <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
            <Star className="h-6 w-6 text-yellow-500" />
            <div>
                <p className="text-sm font-medium text-muted-foreground">Pontszám</p>
                <p className="text-2xl font-bold">{progress?.score || 0}</p>
            </div>
          </div>

          <Progress value={courseProgressPercentage} className="mb-4 h-2" />

          <Accordion type="single" collapsible defaultValue="module-0" className="w-full">
            {initialCourse.modules.map((module, moduleIndex) => {
              let prevChapter: Chapter | null = null;
              return (
                <AccordionItem value={`module-${moduleIndex}`} key={module._id}>
                  <AccordionTrigger className="font-semibold">{module.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1 pl-2 border-l-2">
                      {module.chapters.map((chapter) => {
                        const isCompleted = completedChaptersSet.has(chapter._id);
                        const isUnlocked = !prevChapter || completedChaptersSet.has(prevChapter._id);
                        const isActive = chapter._id === activeChapter._id;
                        prevChapter = chapter;

                        return (
                          <button
                            key={chapter._id}
                            onClick={() => handleChapterSelect(chapter)}
                            disabled={!isUnlocked}
                            className={`flex items-center gap-3 p-3 rounded-md text-left transition-colors w-full ${
                              isActive ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted/80'
                            } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              isUnlocked ? <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" /> : <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="flex-grow text-sm font-medium">{chapter.title}</span>
                            <Badge variant="secondary">{chapter.points} pont</Badge>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </aside>

      {/* JOBB OLDALI TARTALOM */}
      <main>
        <Card className="min-h-[70vh] flex flex-col shadow-lg border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">{activeChapter.title}</CardTitle>
            <CardDescription>
              {activeChapter.type === 'lesson' ? 'Tananyag' : 'Kvíz'} | {activeChapter.points} pont
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow prose dark:prose-invert max-w-none text-base leading-relaxed">
            <p>{activeChapter.content}</p>
          </CardContent>
          <CardFooter className="border-t pt-6 bg-muted/50 flex justify-end">
            <Button 
              onClick={handleCompleteChapter} 
              disabled={isLoading || isCurrentChapterCompleted}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {isCurrentChapterCompleted ? 'Befejezve' : 'Lecke Befejezése'}
              {!isCurrentChapterCompleted && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}