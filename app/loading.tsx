// You can choose from the following loading indicators.
// To select an indicator, uncomment its corresponding component definition
// and the line that assigns it to `LoadingIndicator`.

// Option 1: Pulsing Dots
const PulsingDots = () => (
  <div className="flex space-x-2">
    <div className="h-3 w-3 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]"></div>
    <div className="h-3 w-3 animate-pulse rounded-full bg-primary [animation-delay:-0.15s]"></div>
    <div className="h-3 w-3 animate-pulse rounded-full bg-primary"></div>
  </div>
);

// Option 2: Simple Loading Bar
// const SimpleLoadingBar = () => (
//   <div className="w-32 h-2 bg-gray-200 rounded-full">
//     <div className="w-1/2 h-full bg-primary rounded-full animate-pulse"></div>
//   </div>
// );

// Option 3: Blinking Text
// const BlinkingText = () => (
//   <p className="text-lg font-semibold animate-pulse">Loading...</p>
// );

// Assign the chosen indicator to the LoadingIndicator constant
const LoadingIndicator = PulsingDots;
// const LoadingIndicator = SimpleLoadingBar;
// const LoadingIndicator = BlinkingText;

export default function Loading() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <LoadingIndicator />
    </div>
  );
}
