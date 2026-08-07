import { SimpleGreetingHeader } from "@/src/components/SimpleGreetingHeader";

type Props = {
  name: string;
};

/** Dashboard top chrome — greeting + wave + bell (no avatar). */
export function DashboardHeader({ name }: Props) {
  return <SimpleGreetingHeader name={name} showAvatar={false} />;
}
