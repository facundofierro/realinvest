import { createInMemoryCustodyProvider } from "../testing/in-memory-provider";
import { runCustodyProviderConformanceSuite } from ".";

let current: ReturnType<typeof createInMemoryCustodyProvider>;
runCustodyProviderConformanceSuite(
  () => { current = createInMemoryCustodyProvider(); return current.provider; },
  { fund: (...args) => current.fund(...args), settle: () => current.settle() },
);
