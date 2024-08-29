import { AntdComponentsDemo } from "@/components/antd-components-demo";
import config from "../../../../tailwind.config";
import { values } from "lodash";

const TailwindColor: React.FC<{ color: string; name: string }> = ({ color, name }) => {
  return (
    <div className="p-12 border flex flex-col items-center gap-1">
      <div
        className={`w-24 h-24 flex justify-center items-center font-mono rounded border`}
        style={{ backgroundColor: color.replace("<alpha-value>", "100") }}
      />
      <span className="font-mono">{name}</span>
    </div>
  );
};

export default function ComponentsPage() {
  const entries = config?.theme?.extend?.colors ? Object.entries(config?.theme?.extend?.colors) : [];
  return (
    <div className="py-4 px-12">
      <h1 className="text-3xl font-bold border-b pb-6 mb-6">Antd</h1>
      <AntdComponentsDemo />
      <h1 className="text-3xl font-bold border-b py-6 mb-6">Tailwind colors</h1>
      <div className="gap-2 flex flex-wrap">
        {entries.map(([key, value]) => (
          <TailwindColor key={key} name={key} color={value} />
        ))}
      </div>
    </div>
  );
}
