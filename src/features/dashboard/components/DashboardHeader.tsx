import { SimpleGreetingHeader } from "@/src/components/SimpleGreetingHeader";

type Props = {
  name: string;
};

/** Dashboard top chrome — greeting + wave + reminder logs entry. */
export function DashboardHeader({ name }: Props) {
  return <SimpleGreetingHeader name={name} showAvatar={false} />;
}
