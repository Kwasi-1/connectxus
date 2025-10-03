import{ Button } from '@/components/ui/button';

function CustomButton({ variant, onClick, className, Icon, text }: { variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost", onClick: () => void, className?: string, Icon: React.ElementType, text?: string }) {
  return (
    <Button variant={variant} onClick={onClick} className={className}>
      <Icon className="h-4 w-4" />
      <span className='hidden md:block ml-2'>{text}</span>
    </Button>
  )
}
export default Button;