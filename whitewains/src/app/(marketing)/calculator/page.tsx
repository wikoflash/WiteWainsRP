import { CraftingCalculator } from '@/components/calculator';

export default function CalculatorPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-primary/70 text-xs tracking-[0.35em] uppercase mb-3">White Wains</p>
        <h1 className="text-4xl font-bold tracking-[0.12em] uppercase text-foreground mb-4">Crafting Calculator</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Select weapons, ammo, and throwables — see the exact resources needed and check against your inventory.
        </p>
      </div>
      <CraftingCalculator />
    </div>
  );
}
