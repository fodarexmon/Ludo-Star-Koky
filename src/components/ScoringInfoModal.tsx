import React from "react";

export function ScoringInfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-black/80 p-4 animate-in fade-in backdrop-blur-md">
      <div className="panel max-w-2xl w-full shadow-2xl border border-primary/20 bg-black/95 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          ✕
        </button>
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          نظام النقاط والنقود 🏆
        </h2>
        
        <div className="space-y-6 text-right">
          <section className="bg-white/5 p-5 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-3 flex items-center justify-end gap-2 text-primary">
              مباريات السلسلة (Best of 5)
            </h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              تتكون السلسلة من 5 مباريات متتالية. في نهاية كل مباراة، يتم توزيع النقاط والنقود على اللاعبين حسب مركزهم وعدد اللاعبين في الغرفة. تتراكم النقاط لتحديد الفائز ببطولة السلسلة في النهاية!
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-black/50 p-4 rounded-xl">
                <h4 className="font-bold text-lg mb-2 text-blue-400">غرفة 4 لاعبين 👥</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-yellow-400 font-bold">المركز الأول 🥇</span>
                    <span>5 نقاط | 100 🪙</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-gray-300 font-bold">المركز الثاني 🥈</span>
                    <span>3 نقاط | 50 🪙</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-amber-600 font-bold">المركز الثالث 🥉</span>
                    <span>1 نقطة | 30 🪙</span>
                  </li>
                  <li className="flex justify-between items-center text-muted-foreground">
                    <span>المركز الرابع 😢</span>
                    <span>0 نقاط | 10 🪙</span>
                  </li>
                </ul>
              </div>

              <div className="bg-black/50 p-4 rounded-xl">
                <h4 className="font-bold text-lg mb-2 text-green-400">غرفة 3 لاعبين 👥</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-yellow-400 font-bold">المركز الأول 🥇</span>
                    <span>3 نقاط | 100 🪙</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-gray-300 font-bold">المركز الثاني 🥈</span>
                    <span>1 نقطة | 50 🪙</span>
                  </li>
                  <li className="flex justify-between items-center text-muted-foreground">
                    <span>المركز الثالث 😢</span>
                    <span>0 نقاط | 20 🪙</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-black/50 p-4 rounded-xl md:col-span-2">
                <h4 className="font-bold text-lg mb-2 text-purple-400">غرفة لاعبين فقط 👥</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-yellow-400 font-bold">المركز الأول 🥇</span>
                    <span>2 نقاط | 100 🪙</span>
                  </li>
                  <li className="flex justify-between items-center text-muted-foreground">
                    <span>المركز الثاني 😢</span>
                    <span>0 نقاط | 20 🪙</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-destructive/10 p-5 rounded-2xl border border-destructive/20">
            <h3 className="text-xl font-bold mb-2 flex items-center justify-end gap-2 text-destructive">
              الانسحاب والطرد ⚠️
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-destructive-foreground/90 font-medium">
              <li>إذا انسحب اللاعب أو طرده المضيف، فإنه يحصل على المركز الأخير تلقائياً بـ 0 نقطة في تلك المباراة.</li>
              <li>في حال استمراره كمتفرج في السلسلة، سيبقى رصيد نقاطه كما هو دون زيادة.</li>
              <li>إذا غادر الغرفة بالكامل قبل انتهاء المباريات الـ 5، سيتم تصفير جميع نقاطه كعقوبة!</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
