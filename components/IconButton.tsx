import { ComponentProps, forwardRef } from "react";
import { tv, VariantProps } from "tailwind-variants";

const iconButton = tv({
    base: "rounded-full bg-gradient-to-br from-brand-400 to-brand-500 text-accent-50 p-3",
});

type Props = ComponentProps<"button"> & VariantProps<typeof iconButton>;
const IconButton = forwardRef<HTMLButtonElement, Props>((props, ref) => (
    <button
        {...props}
        ref={ref}
        className={iconButton({ className: props.className })}
    />
));

IconButton.displayName = "IconButton";
export default IconButton;
