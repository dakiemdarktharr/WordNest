export {};
declare global {
  interface Window {
    wordnestDesktop?: {
      isDesktop: boolean;
      speak: (
        text: string,
      ) => Promise<{ ok: boolean; error?: string; voice?: string }>;
      onImport: (callback: () => void) => () => void;
    };
  }
}
