import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  TreePine,
  UtensilsCrossed,
  FlaskConical,
  Palette,
  Dumbbell,
  BookOpen,
  Calculator,
  Wrench,
  Heart,
  HandHeart,
} from 'lucide-react';

export const metadata = {
  title: 'Browse — The Hedge',
};

const CATEGORIES = [
  { name: 'Nature & Outdoor', icon: TreePine, count: 0, color: 'text-green-600' },
  { name: 'Kitchen & Food', icon: UtensilsCrossed, count: 0, color: 'text-amber-600' },
  { name: 'Science & Discovery', icon: FlaskConical, count: 0, color: 'text-blue-600' },
  { name: 'Art & Creativity', icon: Palette, count: 0, color: 'text-purple-600' },
  { name: 'Movement & Physical', icon: Dumbbell, count: 0, color: 'text-red-600' },
  { name: 'Literacy & Language', icon: BookOpen, count: 0, color: 'text-indigo-600' },
  { name: 'Maths in Real Life', icon: Calculator, count: 0, color: 'text-teal-600' },
  { name: 'Life Skills', icon: Wrench, count: 0, color: 'text-orange-600' },
  { name: 'Calm & Mindful', icon: Heart, count: 0, color: 'text-pink-600' },
  { name: 'Social & Community', icon: HandHeart, count: 0, color: 'text-cyan-600' },
];

export default function BrowsePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Browse activities</h1>
        <p className="text-muted-foreground">
          Explore activities by category. Content library coming in Phase 2.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map(({ name, icon: Icon, color }) => (
          <Card
            key={name}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <Icon className={`h-6 w-6 ${color}`} />
              <CardTitle className="text-base">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activities coming soon
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
