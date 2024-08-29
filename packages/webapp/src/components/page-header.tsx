export const PageHeader: React.FC<{ children: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode }> = (props) => {

  return <div className="flex flex-col gap-2 ite">
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{props.children}</h1>
        {props.description && <p className="text-text-light font-lighter text-sm">{props.description}</p>}
      </div>
      {props.actions && <div className="flex gap-2">{props.actions}</div>}
    </div>
  </div>
};