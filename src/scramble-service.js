const EVENT_3X3 = '333';

export function createScrambleRuntimeLoader({
  importScrambleModule = () => import('cubing/scramble'),
  importSearchModule = () => import('cubing/search'),
} = {}) {
  let runtimePromise;

  return async function loadScrambleRuntime() {
    if (!runtimePromise) {
      runtimePromise = Promise.all([importScrambleModule(), importSearchModule()]).then(([scrambleModule, searchModule]) => {
        searchModule.setSearchDebug({
          logPerf: false,
          prioritizeEsbuildWorkaroundForWorkerInstantiation: true,
          scramblePrefetchLevel: 'none',
          showWorkerInstantiationWarnings: false,
        });

        return {
          randomScrambleForEvent: scrambleModule.randomScrambleForEvent,
        };
      });
    }

    return runtimePromise;
  };
}

const loadScrambleRuntime = createScrambleRuntimeLoader();

export async function generateScramble(runtimeLoader = loadScrambleRuntime) {
  const { randomScrambleForEvent } = await runtimeLoader();
  const alg = await randomScrambleForEvent(EVENT_3X3);
  return alg.toString();
}
