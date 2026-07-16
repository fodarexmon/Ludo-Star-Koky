import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/instructions")({
  component: InstructionsPage,
});

function InstructionsPage() {
  return (
    <div className="min-h-screen p-6 md:p-12 relative overflow-y-auto" dir="rtl">
      {/* Background decorations */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="mx-auto max-w-4xl relative z-10 pb-20">
        <div className="flex items-center gap-4 mb-8 sticky top-0 bg-background/80 backdrop-blur-md py-4 border-b border-white/5 z-20">
          <Link to="/" className="btn-ghost !p-3 transform rotate-180">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-600">
            📖 الدليل الشامل وقواعد اللعبة
          </h1>
        </div>

        <div className="space-y-8">
          
          {/* Section 1: Basics */}
          <section className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🎲</span> أساسيات اللعب
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-5 rounded-2xl">
                <h3 className="text-lg font-bold text-purple-400 mb-2">الهدف الرئيسي</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  يمتلك كل لاعب 4 قطع في قاعدته. الهدف هو الدوران حول اللوحة وإيصال جميع القطع الأربع إلى "المركز" (الملاذ الأخير) قبل باقي اللاعبين.
                </p>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl">
                <h3 className="text-lg font-bold text-purple-400 mb-2">قواعد الرقم 6</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>لإخراج قطعة من القاعدة، يجب أن يظهر الرقم <strong>6</strong>.</li>
                  <li>عند ظهور الرقم 6، تحصل على <strong>لفة نرد إضافية</strong>.</li>
                  <li>إذا ظهر الرقم 6 <span className="text-destructive font-bold">ثلاث مرات متتالية</span>، يضيع دورك!</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Combat */}
          <section className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">⚔️</span> القتال والمناطق الآمنة
            </h2>
            <div className="space-y-4">
              <div className="bg-black/30 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="text-4xl">🏃‍♂️</div>
                <div>
                  <h3 className="text-white font-bold mb-1">أكل قطع الخصم (Capture)</h3>
                  <p className="text-sm text-white/70">إذا تحركت قطعتك وتوقفت في نفس المربع الذي توجد فيه قطعة لخصمك، فسيتم أكل قطعته وإعادتها لنقطة البداية. كمكافأة لك، <strong>ستحصل على لفة نرد إضافية!</strong></p>
                </div>
              </div>
              <div className="bg-black/30 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="text-4xl">🛡️</div>
                <div>
                  <h3 className="text-white font-bold mb-1">المناطق الآمنة (Safe Zones)</h3>
                  <p className="text-sm text-white/70">المربعات المميزة بعلامة 🌟 أو المربعات الملونة بمسار النهاية هي مناطق آمنة. لا يمكن لأي لاعب أكل قطعة لاعب آخر إذا كانت تتواجد في هذه المربعات.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Game Modes */}
          <section className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">🎮</span> أطوار اللعب
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                <h3 className="text-xl font-bold text-white mb-2">اللعب المحلي (Offline)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  العب مع أصدقائك على نفس الجهاز، أو تدرب باللعب ضد الذكاء الاصطناعي (البوتات). يمكنك تحديد اللاعبين واختيار اللعب بملفك الشخصي بكامل تخصيصاته بدون إنترنت.
                </p>
              </div>
              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl group-hover:bg-fuchsia-500/20 transition-colors" />
                <h3 className="text-xl font-bold text-white mb-2">اللعب المباشر (Online)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  تنافس مع لاعبين من حول العالم عبر الإنترنت! يمكنك إنشاء غرفة خاصة وإعطاء كود الغرفة لأصدقائك، أو الانضمام العشوائي. يتطلب رسوم دخول من العملات (الكوينز).
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Store & Customization */}
          <section className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">🛍️</span> المتجر والتخصيصات
            </h2>
            <p className="text-muted-foreground mb-4">
              اربح العملات من اللعب لتمييز ملفك الشخصي وشكل اللعبة! كل المشتريات تظهر لك ولخصومك في وضع الأونلاين.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl mb-2">🎨</div>
                <div className="text-sm font-bold">لوحات اللعب</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl mb-2">🎲</div>
                <div className="text-sm font-bold">أشكال النرد</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl mb-2">♟️</div>
                <div className="text-sm font-bold">قطع اللعب</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl mb-2">🖼️</div>
                <div className="text-sm font-bold">إطارات البروفايل</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl mb-2">✨</div>
                <div className="text-sm font-bold">تأثيرات الحركة</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl mb-2">😆</div>
                <div className="text-sm font-bold">حزم الإيموجي</div>
              </div>
            </div>
          </section>

          {/* Section 5: Interaction & Friends */}
          <section className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-pink-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">💬</span> التواصل والأصدقاء
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong>المحادثة الصوتية (Voice Chat):</strong> تواصل مباشرة مع اللاعبين أثناء اللعب! يمكنك كتم المايكروفون الخاص بك، أو كتم لاعب محدد إذا أردت الهدوء. يتطلب إعطاء صلاحية المايكروفون للمتصفح.</p>
              <p><strong>الإيموجي المتحرك:</strong> أرسل إيموجيات تعبيرية متحركة ومضحكة للخصوم أثناء اللعب من خلال لوحة اللاعب. (يمكنك شراء حزم إيموجيات جديدة من المتجر).</p>
              <p><strong>نظام الأصدقاء:</strong> أضف أصدقائك باستخدام كود الصداقة الخاص بهم، تابع تقدمهم في لوحة الشرف، وقم بدعوتهم لمباريات خاصة بسهولة.</p>
            </div>
          </section>

          {/* Section 6: Punishments & Fair Play */}
          <section className="bg-black/60 border border-destructive/30 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-destructive to-transparent" />
            <h2 className="text-2xl font-bold text-destructive mb-6 flex items-center gap-3">
              <span className="text-3xl">⚖️</span> القوانين والعقوبات
            </h2>
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
                <h3 className="text-destructive font-bold mb-1">الانسحاب الهروبي (Rage Quit)</h3>
                <p className="text-sm text-destructive-foreground/80">إذا قمت بالضغط على زر "انسحاب" طوعاً أثناء مباراة أونلاين، <strong>سيتم حظرك من اللعب المباشر لمدة 15 دقيقة</strong>. اللعب النظيف وتحمل الخسارة هو من شيم الأبطال!</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                <h3 className="text-orange-400 font-bold mb-1">الغياب وتفويت الدور (AFK)</h3>
                <p className="text-sm text-orange-200/80">لديك وقت محدود للعب دورك. إذا انتهى الوقت سيتم لعب الدور تلقائياً. <strong>إذا قمت بتفويت الدور 5 مرات متتالية</strong> سيتم استبعادك من المباراة تلقائياً لعدم تعطيل اللاعبين الآخرين.</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                <h3 className="text-yellow-400 font-bold mb-1">الاحترام في المحادثات</h3>
                <p className="text-sm text-yellow-200/80">يُمنع الإساءة للآخرين في المحادثات الصوتية. في حال الانزعاج، يمكنك دائماً كتم (Mute) اللاعب المزعج من خلال الضغط على أيقونة الصوت بجانب اسمه.</p>
              </div>
            </div>
          </section>
          
          {/* Section 7: Achievements */}
          <section className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-sm text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              اجمع الإنجازات وتباهى بها!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              تمتلك اللعبة نظام إنجازات متطور. العب، فز، كدّس ثروتك، والتهم قطع خصومك لفتح إنجازات أسطورية مثل "ملك اللودو" و "القاتل المحترف"!
            </p>
            <Link to="/achievements" className="btn-game inline-block bg-gradient-to-r from-yellow-500 to-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              استكشف الإنجازات الآن
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
