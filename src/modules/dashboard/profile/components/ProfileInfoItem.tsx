interface ProfileInfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | React.ReactNode;
}

const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  </div>
);

export default ProfileInfoItem;
