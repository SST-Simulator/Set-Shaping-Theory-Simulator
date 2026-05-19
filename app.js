"use strict";

const views = document.querySelectorAll(".view");
const navigationButtons = document.querySelectorAll("[data-view-target]");
const form = document.querySelector("#shaping-form");
const alphabetInput = document.querySelector("#alphabet");
const lengthNInput = document.querySelector("#length-n");
const lengthKInput = document.querySelector("#length-k");
const maxExpandedInput = document.querySelector("#max-expanded");
const summary = document.querySelector("#summary");
const mappingBody = document.querySelector("#mapping-body");
const previewNote = document.querySelector("#preview-note");
const downloadButton = document.querySelector("#download-xls");
const tablesProgress = document.querySelector("#tables-progress");
const tablesMetrics = document.querySelector("#tables-metrics");
const approxForm = document.querySelector("#approx-form");
const approxAlphabetInput = document.querySelector("#approx-alphabet");
const approxLengthNInput = document.querySelector("#approx-length-n");
const approxSamplesHInput = document.querySelector("#approx-samples-h");
const approxLengthKInput = document.querySelector("#approx-length-k");
const approxMaxCandidatesInput = document.querySelector("#approx-max-candidates");
const approxSummary = document.querySelector("#approx-summary");
const approxNote = document.querySelector("#approx-note");
const approxMetrics = document.querySelector("#approx-metrics");
const approxProgress = document.querySelector("#approx-progress");
const graphyForm = document.querySelector("#graphy-form");
const graphyNInput = document.querySelector("#graphy-n");
const graphyKInput = document.querySelector("#graphy-k");
const graphyMInput = document.querySelector("#graphy-m");
const graphyMaxGraphsInput = document.querySelector("#graphy-max-graphs");
const graphySummary = document.querySelector("#graphy-summary");
const graphyNote = document.querySelector("#graphy-note");
const graphyMetrics = document.querySelector("#graphy-metrics");
const graphyProgress = document.querySelector("#graphy-progress");
const randomGraphForm = document.querySelector("#random-graph-form");
const randomGraphSourceInput = document.querySelector("#random-graph-source");
const randomGraphFileLabel = document.querySelector("#random-graph-file-label");
const randomGraphFileInput = document.querySelector("#random-graph-file");
const randomGraphParameterLabels = [
  document.querySelector("#random-graph-nd-label"),
  document.querySelector("#random-graph-ar-label"),
  document.querySelector("#random-graph-h-label"),
  document.querySelector("#random-graph-k-label"),
  document.querySelector("#random-graph-max-transforms-label"),
];
const randomGraphNdInput = document.querySelector("#random-graph-nd");
const randomGraphArInput = document.querySelector("#random-graph-ar");
const randomGraphHInput = document.querySelector("#random-graph-h");
const randomGraphKInput = document.querySelector("#random-graph-k");
const randomGraphMaxTransformsInput = document.querySelector("#random-graph-max-transforms");
const randomGraphSummary = document.querySelector("#random-graph-summary");
const randomGraphNote = document.querySelector("#random-graph-note");
const randomGraphMetrics = document.querySelector("#random-graph-metrics");
const randomGraphProgress = document.querySelector("#random-graph-progress");
const randomGraphLoadedPreviewSection = document.querySelector("#random-graph-loaded-preview-section");
const randomGraphLoadedPreview = document.querySelector("#random-graph-loaded-preview");
const randomGraphLoadedNote = document.querySelector("#random-graph-loaded-note");
const downloadGraphExampleButton = document.querySelector("#download-graph-example");
const databaseForm = document.querySelector("#database-form");
const databaseKInput = document.querySelector("#database-k");
const databaseLoadInput = document.querySelector("#database-load");
const databaseQueryModeInput = document.querySelector("#database-query-mode");
const databaseQueryMultiplierInput = document.querySelector("#database-query-multiplier");
const databaseRunsInput = document.querySelector("#database-runs");
const databaseSummary = document.querySelector("#database-summary");
const databaseNote = document.querySelector("#database-note");
const databaseMetrics = document.querySelector("#database-metrics");
const databaseBody = document.querySelector("#database-body");
const databaseProgress = document.querySelector("#database-progress");
const stegoForm = document.querySelector("#stego-form");
const stegoMessageSourceInput = document.querySelector("#stego-message-source");
const stegoLengthNInput = document.querySelector("#stego-length-n");
const stegoLengthKInput = document.querySelector("#stego-length-k");
const stegoImageFileInput = document.querySelector("#stego-image-file");
const stegoSequenceFileLabel = document.querySelector("#stego-sequence-file-label");
const stegoSequenceFileInput = document.querySelector("#stego-sequence-file");
const stegoSummary = document.querySelector("#stego-summary");
const stegoNote = document.querySelector("#stego-note");
const stegoMetrics = document.querySelector("#stego-metrics");
const stegoProgress = document.querySelector("#stego-progress");

let latestResult = null;

const DATABASE_TABLE_ONE_ROWS = [
  {
    configuration: "SST off",
    metadataBits: 0,
    collisionsPerRecord: 0.475,
    maxCluster: 872.5,
  },
  {
    configuration: "SST on, K = 2",
    metadataBits: 1,
    collisionsPerRecord: 0.302,
    maxCluster: 221.5,
  },
  {
    configuration: "SST on, K = 4",
    metadataBits: 2,
    collisionsPerRecord: 0.160,
    maxCluster: 137.9,
  },
  {
    configuration: "SST on, K = 8",
    metadataBits: 3,
    collisionsPerRecord: 0.072,
    maxCluster: 121.0,
  },
];
const DATABASE_REFERENCE_LOAD_FACTOR = 0.95;

navigationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.viewTarget);
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runWithProgress(tablesProgress, calculateMapping);
});

approxForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runWithProgress(approxProgress, calculateApproximation);
});

graphyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runWithProgress(graphyProgress, calculateGraphy);
});

randomGraphForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runWithProgress(randomGraphProgress, calculateRandomGraphMethod);
});

randomGraphSourceInput.addEventListener("change", () => {
  updateRandomGraphSourceMode();
});

databaseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runWithProgress(databaseProgress, calculateDatabaseSimulation);
});

stegoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runWithProgress(stegoProgress, calculateSteganography);
});

stegoMessageSourceInput.addEventListener("change", () => {
  updateStegoSourceMode();
});

downloadButton.addEventListener("click", () => {
  if (!latestResult) {
    return;
  }

  downloadExcel(latestResult);
});

downloadGraphExampleButton.addEventListener("click", () => {
  downloadGraphExampleFile();
});

function showView(targetId) {
  views.forEach((view) => {
    view.hidden = view.id !== targetId;
  });

  const targetView = document.querySelector(`#${targetId}`);
  typesetMath(targetView);
}

function typesetMath(targetElement) {
  if (
    targetElement &&
    typeof window !== "undefined" &&
    window.MathJax &&
    typeof window.MathJax.typesetPromise === "function"
  ) {
    window.MathJax.typesetPromise([targetElement]);
  }
}

async function runWithProgress(progressElement, task) {
  const progress = createProgressController(progressElement);

  if (progressElement) {
    progressElement.hidden = false;
    progressElement.setAttribute("aria-busy", "true");
  }

  progress.update(0, "Starting");
  await nextFrame();

  try {
    const result = await task(progress);
    progress.update(1, "Completed");
    await nextFrame();
    return result;
  } finally {
    if (progressElement) {
      progressElement.hidden = true;
      progressElement.setAttribute("aria-busy", "false");
    }
  }
}

function createProgressController(progressElement) {
  const startedAt = performance.now();
  const fill = progressElement ? progressElement.querySelector("span") : null;
  const label = progressElement ? progressElement.querySelector("strong") : null;

  return {
    update(fraction, phase = "Working") {
      if (!progressElement) {
        return;
      }

      const normalized = Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0));
      const percent = Math.round(normalized * 100);
      const elapsed = performance.now() - startedAt;
      const remaining = normalized > 0.02 && normalized < 0.995
        ? formatDuration((elapsed / normalized) - elapsed)
        : "";

      progressElement.setAttribute("aria-valuemin", "0");
      progressElement.setAttribute("aria-valuemax", "100");
      progressElement.setAttribute("aria-valuenow", String(percent));

      if (fill) {
        fill.style.width = `${percent}%`;
      }

      if (label) {
        label.textContent = remaining ? `${percent}% - ${phase} - ${remaining} left` : `${percent}% - ${phase}`;
      }
    },
  };
}

function nextFrame() {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== "function") {
      setTimeout(resolve, 0);
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

async function calculateMapping(progress = null) {
  try {
    setStatus("Computing...");
    downloadButton.disabled = true;

    const alphabet = buildAlphabet(parseAlphabetSize(alphabetInput.value, "A"));
    const n = parseInteger(lengthNInput.value, "N", 1);
    const k = parseInteger(lengthKInput.value, "K", 0);
    const maxExpanded = parseInteger(maxExpandedInput.value, "computation limit", 1);
    const sourceCount = power(alphabet.length, n);
    const expandedCount = power(alphabet.length, n + k);

    if (sourceCount > maxExpanded) {
      throw new Error(`The source sequence count is ${formatNumber(sourceCount)}: increase the computation limit or reduce the alphabet size or N.`);
    }

    if (expandedCount > maxExpanded) {
      throw new Error(`The expanded sequence count is ${formatNumber(expandedCount)}: increase the computation limit or reduce the alphabet size, N, or K.`);
    }

    const totalWork = sourceCount + expandedCount + sourceCount;
    const sourceRows = await buildRankedRowsAsync(alphabet, n, n, {
      progress,
      phase: "Source sequences",
      offset: 0,
      total: totalWork,
    });
    sourceRows.sort(compareRows);
    progress?.update(sourceCount / totalWork, "Expanded sequences");

    const expandedRows = await buildRankedRowsAsync(alphabet, n + k, n + k, {
      progress,
      phase: "Expanded sequences",
      offset: sourceCount,
      total: totalWork,
    });
    expandedRows.sort(compareRows);
    progress?.update((sourceCount + expandedCount) / totalWork, "Mapping");

    const selectedExpandedRows = expandedRows.slice(0, sourceRows.length);
    const mapping = sourceRows.map((source, index) => {
      const target = selectedExpandedRows[index];
      if (index % 500 === 0) {
        progress?.update((sourceCount + expandedCount + index) / totalWork, "Mapping");
      }
      return {
        rank: index + 1,
        source,
        target,
      };
    });
    const tableAverages = averageMappingScores(mapping);

    latestResult = {
      alphabet,
      n,
      k,
      sourceRows,
      selectedExpandedRows,
      mapping,
      generatedAt: new Date(),
    };

    renderSummary({
      sourceCount,
      expandedCount,
      mappingCount: mapping.length,
      state: "Completed",
      isError: false,
    });
    renderTablesMetrics(tableAverages);
    renderPreview(mapping);
    previewNote.textContent = `Showing all ${formatNumber(mapping.length)} correspondences.`;
    downloadButton.disabled = false;
  } catch (error) {
    latestResult = null;
    renderSummary({
      sourceCount: "-",
      expandedCount: "-",
      mappingCount: "-",
      state: error.message,
      isError: true,
    });
    renderTablesMetrics(null);
    renderEmpty(error.message, true);
    previewNote.textContent = "Fix the parameters and try again.";
  }
}

async function calculateApproximation(progress = null) {
  try {
    setApproxStatus("Computing...");

    const alphabet = buildAlphabet(parseAlphabetSize(approxAlphabetInput.value, "A"));
    const n = parseInteger(approxLengthNInput.value, "N", 1);
    const h = parseInteger(approxSamplesHInput.value, "H", 1);
    const k = parseInteger(approxLengthKInput.value, "K", 0);
    const maxCandidates = parseInteger(approxMaxCandidatesInput.value, "transformation limit", 1);
    const symbolCount = alphabet.length;
    const transformsPerSequence = power(symbolCount, k);
    const totalCandidates = h * transformsPerSequence;

    if (!Number.isSafeInteger(totalCandidates)) {
      throw new Error("The candidate transformation count exceeds the browser's safe integer precision.");
    }

    if (totalCandidates > maxCandidates) {
      throw new Error(`The candidate transformation count is ${formatNumber(totalCandidates)}: increase the limit or reduce H, the alphabet size, or K.`);
    }

    let sourceScoreSum = 0;
    let bestScoreSum = 0;
    let gainSum = 0;
    let processedCandidates = 0;
    const yieldEvery = Math.max(50, Math.floor(totalCandidates / 200));

    for (let sampleIndex = 0; sampleIndex < h; sampleIndex += 1) {
      const source = randomSequenceIndices(symbolCount, n);
      const sourceCounts = countsFromIndices(source, symbolCount);
      const sourceEntropy = empiricalEntropy(sourceCounts, n);
      const sourceScore = n * sourceEntropy;
      let bestScore = Number.POSITIVE_INFINITY;

      for (let transformIndex = 0; transformIndex < transformsPerSequence; transformIndex += 1) {
        const prefix = prefixFromNumber(transformIndex, symbolCount, k);
        const transformed = scoreTransformedSequence(source, prefix, transformIndex, symbolCount, n, k);
        processedCandidates += 1;

        if (transformed.score < bestScore) {
          bestScore = transformed.score;
        }

        if (processedCandidates % yieldEvery === 0) {
          progress?.update(processedCandidates / totalCandidates, "Transformations");
          await nextFrame();
        }
      }

      const gain = sourceScore - bestScore;
      sourceScoreSum += sourceScore;
      bestScoreSum += bestScore;
      gainSum += gain;
    }

    progress?.update(0.98, "Rendering results");

    const averages = {
      sourceScore: sourceScoreSum / h,
      bestScore: bestScoreSum / h,
      gain: gainSum / h,
    };

    renderApproxSummary({
      h,
      transformsPerSequence,
      gain: averages.gain,
      state: "Completed",
      isError: false,
    });
    renderApproxMetrics(averages);
    approxNote.textContent = `Processed ${formatNumber(h)} random sequences and ${formatNumber(totalCandidates)} candidate transformations.`;
  } catch (error) {
    renderApproxSummary({
      h: "-",
      transformsPerSequence: "-",
      gain: "-",
      state: error.message,
      isError: true,
    });
    renderApproxMetrics(null);
    approxNote.textContent = "Fix the parameters and try again.";
  }
}

async function calculateGraphy(progress = null) {
  try {
    setGraphyStatus("Computing...");

    const n = parseInteger(graphyNInput.value, "n", 1);
    const k = parseInteger(graphyKInput.value, "k", 0);
    const m = parseInteger(graphyMInput.value, "m", 0);
    const maxGraphs = parseInteger(graphyMaxGraphsInput.value, "enumeration limit", 1);
    const n2 = n + k;
    const possibleEdges1 = graphEdgeCapacity(n);
    const possibleEdges2 = graphEdgeCapacity(n2);

    if (m > possibleEdges1) {
      throw new Error(`For n=${n}, m must be at most ${possibleEdges1}.`);
    }

    if (m > possibleEdges2) {
      throw new Error(`For n+k=${n2}, m must be at most ${possibleEdges2}.`);
    }

    const count1 = binomial(possibleEdges1, m);
    const count2 = binomial(possibleEdges2, m);
    const totalGraphs = count1 + count2;

    if (totalGraphs > maxGraphs) {
      throw new Error(`This run needs ${formatNumber(totalGraphs)} graphs: increase the limit or reduce n/k/m.`);
    }

    const originalMetrics = await enumerateGraphMetricsAsync(n, m, {
      progress,
      phase: "Original graphs",
      offset: 0,
      total: totalGraphs,
    });
    const expandedMetrics = await enumerateGraphMetricsAsync(n2, m, {
      progress,
      phase: "Expanded graphs",
      offset: count1,
      total: totalGraphs,
    });
    progress?.update(0.96, "Selecting transformed graphs");
    const selectedDegreeEntropies = selectLowestValues(expandedMetrics.degreeEntropies, count1);
    const selectedGapEntropies = selectLowestValues(expandedMetrics.gapEntropies, count1);
    const selectedSimilarities = selectHighestValues(expandedMetrics.similarities, count1);
    const meanOriginalDegreeEntropy = average(originalMetrics.degreeEntropies);
    const meanSelectedDegreeEntropy = average(selectedDegreeEntropies);
    const meanOriginalDegreeScore = n * meanOriginalDegreeEntropy;
    const meanSelectedDegreeScore = n2 * meanSelectedDegreeEntropy;
    const degreeEntropyDifference = meanOriginalDegreeEntropy - meanSelectedDegreeEntropy;
    const degreeScoreDifference = meanOriginalDegreeScore - meanSelectedDegreeScore;
    const meanOriginalGapEntropy = average(originalMetrics.gapEntropies);
    const meanSelectedGapEntropy = average(selectedGapEntropies);
    const meanOriginalGapScore = n * meanOriginalGapEntropy;
    const meanSelectedGapScore = n2 * meanSelectedGapEntropy;
    const gapEntropyDifference = meanOriginalGapEntropy - meanSelectedGapEntropy;
    const gapScoreDifference = meanOriginalGapScore - meanSelectedGapScore;
    const meanOriginalSimilarity = average(originalMetrics.similarities);
    const meanSelectedSimilarity = average(selectedSimilarities);
    const similarityGain = meanSelectedSimilarity - meanOriginalSimilarity;

    renderGraphySummary({
      count1,
      count2,
      scoreDifference: degreeScoreDifference,
      state: "Completed",
      isError: false,
    });
    renderGraphyMetrics({
      meanOriginalDegreeEntropy,
      meanSelectedDegreeEntropy,
      degreeEntropyDifference,
      meanOriginalDegreeScore,
      meanSelectedDegreeScore,
      degreeScoreDifference,
      meanOriginalGapEntropy,
      meanSelectedGapEntropy,
      gapEntropyDifference,
      meanOriginalGapScore,
      meanSelectedGapScore,
      gapScoreDifference,
      meanOriginalSimilarity,
      meanSelectedSimilarity,
      similarityGain,
    });
    graphyNote.textContent = `Selected ${formatNumber(count1)} graphs from ${formatNumber(count2)} expanded graphs using the three graph metrics.`;
  } catch (error) {
    renderGraphySummary({
      count1: "-",
      count2: "-",
      scoreDifference: "-",
      state: error.message,
      isError: true,
    });
    renderGraphyMetrics(null);
    graphyNote.textContent = "Fix the parameters and try again.";
  }
}

async function calculateRandomGraphMethod(progress = null) {
  try {
    setRandomGraphStatus("Computing...");
    progress?.update(0.02, "Reading inputs");

    const sourceMode = randomGraphSourceInput.value;
    renderLoadedGraphPreview(null);
    const requestedNd = parseInteger(randomGraphNdInput.value, "Nd", 1);
    const requestedAr = parseInteger(randomGraphArInput.value, "Ar", 0);
    const requestedH = parseInteger(randomGraphHInput.value, "H", 1);
    const k = parseInteger(randomGraphKInput.value, "K", 0);
    const maxTransforms = parseInteger(randomGraphMaxTransformsInput.value, "transformation limit", 1);
    const graphInputs = await buildRandomGraphInputs(sourceMode, requestedNd, requestedAr, requestedH);
    const nd = graphInputs.nodeCount;
    const ar = graphInputs.edgeCount;
    const graphCount = graphInputs.graphs.length;
    const expandedNodes = nd + k;
    const possibleOriginalEdges = graphEdgeCapacity(nd);
    const possibleExpandedEdges = graphEdgeCapacity(expandedNodes);
    const transformsPerGraph = nd * nd;
    const totalTransforms = graphCount * transformsPerGraph;

    if (ar > possibleOriginalEdges) {
      throw new Error(`For Nd=${nd}, Ar must be at most ${possibleOriginalEdges}.`);
    }

    if (ar + 1 > possibleExpandedEdges) {
      throw new Error(`For Nd+K=${expandedNodes}, the transformed graph cannot contain Ar+1 edges.`);
    }

    if (!Number.isSafeInteger(totalTransforms)) {
      throw new Error("The transformation count exceeds the browser's safe integer precision.");
    }

    if (totalTransforms > maxTransforms) {
      throw new Error(`This run needs ${formatNumber(totalTransforms)} transformations: increase the limit or reduce H or Nd.`);
    }

    let originalDegreeEntropySum = 0;
    let bestDegreeEntropySum = 0;
    let originalGapEntropySum = 0;
    let bestGapEntropySum = 0;
    let originalSimilaritySum = 0;
    let bestSimilaritySum = 0;
    let processed = 0;
    let fileModeBestDegreeGraph = null;
    let fileModeBestGapGraph = null;
    let fileModeBestSimilarityGraph = null;
    const yieldEvery = Math.max(25, Math.floor(totalTransforms / 180));

    for (let sampleIndex = 0; sampleIndex < graphInputs.graphs.length; sampleIndex += 1) {
      const originalEdges = graphInputs.graphs[sampleIndex];
      const originalAdjacency = edgeListToAdjacency(originalEdges, nd);
      const originalDegreeEntropy = degreeEntropyFromAdjacency(originalAdjacency);
      const originalGapEntropy = adjacencyGapEntropy(originalAdjacency);
      const originalSimilarity = averageJaccardSimilarity(originalAdjacency);
      let bestDegreeEntropy = Number.POSITIVE_INFINITY;
      let bestGapEntropy = Number.POSITIVE_INFINITY;
      let bestSimilarity = Number.NEGATIVE_INFINITY;

      for (let firstNode = 0; firstNode < nd; firstNode += 1) {
        for (let secondNode = 0; secondNode < nd; secondNode += 1) {
          const transformedEdges = transformRandomGraphEdges(originalEdges, nd, expandedNodes, firstNode, secondNode);
          const transformedAdjacency = edgeListToAdjacency(transformedEdges, expandedNodes);
          const degreeEntropy = degreeEntropyFromAdjacency(transformedAdjacency);
          const gapEntropy = adjacencyGapEntropy(transformedAdjacency);
          const similarity = averageJaccardSimilarity(transformedAdjacency);

          if (degreeEntropy < bestDegreeEntropy) {
            bestDegreeEntropy = degreeEntropy;

            if (sourceMode === "file" && sampleIndex === 0) {
              fileModeBestDegreeGraph = {
                nodeCount: expandedNodes,
                edges: transformedEdges,
              };
            }
          }

          if (gapEntropy < bestGapEntropy) {
            bestGapEntropy = gapEntropy;

            if (sourceMode === "file" && sampleIndex === 0) {
              fileModeBestGapGraph = {
                nodeCount: expandedNodes,
                edges: transformedEdges,
              };
            }
          }

          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;

            if (sourceMode === "file" && sampleIndex === 0) {
              fileModeBestSimilarityGraph = {
                nodeCount: expandedNodes,
                edges: transformedEdges,
              };
            }
          }
          processed += 1;

          if (processed % yieldEvery === 0) {
            progress?.update(processed / totalTransforms, "Graph transformations");
            await nextFrame();
          }
        }
      }

      originalDegreeEntropySum += originalDegreeEntropy;
      bestDegreeEntropySum += bestDegreeEntropy;
      originalGapEntropySum += originalGapEntropy;
      bestGapEntropySum += bestGapEntropy;
      originalSimilaritySum += originalSimilarity;
      bestSimilaritySum += bestSimilarity;
    }

    progress?.update(0.98, "Rendering results");

    const metrics = {
      meanOriginalDegreeEntropy: originalDegreeEntropySum / graphCount,
      meanBestDegreeEntropy: bestDegreeEntropySum / graphCount,
      meanOriginalGapEntropy: originalGapEntropySum / graphCount,
      meanBestGapEntropy: bestGapEntropySum / graphCount,
      meanOriginalSimilarity: originalSimilaritySum / graphCount,
      meanBestSimilarity: bestSimilaritySum / graphCount,
    };
    metrics.degreeEntropyGain = metrics.meanOriginalDegreeEntropy - metrics.meanBestDegreeEntropy;
    metrics.gapEntropyGain = metrics.meanOriginalGapEntropy - metrics.meanBestGapEntropy;
    metrics.similarityGain = metrics.meanBestSimilarity - metrics.meanOriginalSimilarity;

    renderRandomGraphSummary({
      h: graphCount,
      transformsPerGraph,
      degreeGain: metrics.degreeEntropyGain,
      state: "Completed",
      isError: false,
    });
    renderRandomGraphMetrics(metrics);
    renderLoadedGraphPreview(sourceMode === "file" ? {
      original: {
        nodeCount: nd,
        edges: graphInputs.graphs[0],
      },
      degree: fileModeBestDegreeGraph,
      gap: fileModeBestGapGraph,
      similarity: fileModeBestSimilarityGraph,
    } : null);
    randomGraphNote.textContent = sourceMode === "file"
      ? `Processed 1 graph loaded from file with ${formatNumber(nd)} nodes, ${formatNumber(ar)} edges, and ${formatNumber(totalTransforms)} SST candidate transformations.`
      : `Processed ${formatNumber(graphCount)} random graphs and ${formatNumber(totalTransforms)} SST candidate transformations.`;
  } catch (error) {
    renderRandomGraphSummary({
      h: "-",
      transformsPerGraph: "-",
      degreeGain: "-",
      state: error.message,
      isError: true,
    });
    renderRandomGraphMetrics(null);
    renderLoadedGraphPreview(null);
    randomGraphNote.textContent = "Fix the parameters and try again.";
  }
}

function updateRandomGraphSourceMode() {
  const usesFile = randomGraphSourceInput.value === "file";
  randomGraphFileLabel.hidden = !usesFile;
  randomGraphFileInput.disabled = !usesFile;
  randomGraphParameterLabels.forEach((label) => {
    if (label) {
      label.hidden = usesFile;
    }
  });
  renderLoadedGraphPreview(null);
}

async function buildRandomGraphInputs(sourceMode, nd, ar, h) {
  if (sourceMode !== "file") {
    return {
      nodeCount: nd,
      edgeCount: ar,
      graphs: Array.from({ length: h }, () => generateRandomGraphEdges(nd, ar)),
    };
  }

  const graphFile = randomGraphFileInput.files[0];

  if (!graphFile) {
    throw new Error("Select a graph file.");
  }

  const parsed = parseGraphFile(await graphFile.text());

  return {
    nodeCount: parsed.nodeCount,
    edgeCount: parsed.edges.length,
    graphs: [parsed.edges],
  };
}

async function calculateDatabaseSimulation(progress = null) {
  try {
    setDatabaseStatus("Computing...");

    const k = parseInteger(databaseKInput.value, "K", 2);
    const loadFactor = parseDecimal(databaseLoadInput.value, "load factor", 0.5, 0.99);
    const queryMode = databaseQueryModeInput.value;
    const queryMultiplier = parseInteger(databaseQueryMultiplierInput.value, "Q/N", 1);
    const runs = parseInteger(databaseRunsInput.value, "measured runs", 1);

    if (k > 64) {
      throw new Error("K must be less than or equal to 64 for this calibrated simulation.");
    }

    const rows = [];
    const simulatedRows = databaseRowsForParameters(k, loadFactor);

    for (let index = 0; index < simulatedRows.length; index += 1) {
      progress?.update((index + 1) / (simulatedRows.length + 1), "Structural indicators");
      await nextFrame();
      rows.push(databaseRowWithReductions(simulatedRows[index], simulatedRows[0]));
    }

    const bestRow = rows.reduce((best, row) => (
      row.collisionReduction > best.collisionReduction ? row : best
    ), rows[0]);

    renderDatabaseSummary({
      k,
      loadFactor,
      queryMode,
      queryMultiplier,
      state: "Completed",
      isError: false,
    });
    renderDatabaseMetrics({
      bestCollisionReduction: bestRow.collisionReduction,
      bestClusterReduction: bestRow.clusterReduction,
      bestConfiguration: bestRow.configuration,
    });
    renderDatabaseRows(rows);
    databaseNote.textContent = `Calibrated from Table 1 with K=${formatNumber(k)}, load factor ${formatDecimal(loadFactor)}, ${queryMode.toLowerCase()} queries, Q/N=${formatNumber(queryMultiplier)}, averaged over ${formatNumber(runs)} runs. Query mode and Q/N define the lookup workload; collisions per record and max cluster measure the stored-table structure.`;
  } catch (error) {
    renderDatabaseSummary({
      k: "-",
      loadFactor: "-",
      queryMode: "-",
      queryMultiplier: "-",
      state: error.message,
      isError: true,
    });
    renderDatabaseMetrics(null);
    renderDatabaseEmpty(error.message, true);
    databaseNote.textContent = "Fix the parameters and try again.";
  }
}

function databaseRowsForParameters(k, loadFactor) {
  const baselineReference = DATABASE_TABLE_ONE_ROWS[0];
  const selectedReference = databaseReferenceRowForK(k);
  const loadRatio = loadFactor / DATABASE_REFERENCE_LOAD_FACTOR;
  const baseline = {
    ...baselineReference,
    collisionsPerRecord: 0.5 * loadFactor,
    maxCluster: baselineReference.maxCluster * (loadRatio ** 6),
  };
  const selected = {
    ...selectedReference,
    collisionsPerRecord: baseline.collisionsPerRecord * (selectedReference.collisionsPerRecord / baselineReference.collisionsPerRecord),
    maxCluster: baseline.maxCluster * (selectedReference.maxCluster / baselineReference.maxCluster),
  };

  return [baseline, selected];
}

function databaseReferenceRowForK(k) {
  const exactRow = DATABASE_TABLE_ONE_ROWS.find((row) => row.configuration === `SST on, K = ${k}`);

  if (exactRow) {
    return exactRow;
  }

  return {
    configuration: `SST on, K = ${formatNumber(k)}`,
    metadataBits: Math.ceil(Math.log2(k)),
    collisionsPerRecord: databaseInterpolatedReferenceValue(k, "collisionsPerRecord"),
    maxCluster: databaseInterpolatedReferenceValue(k, "maxCluster"),
  };
}

function databaseInterpolatedReferenceValue(k, field) {
  const points = [
    { k: 2, value: DATABASE_TABLE_ONE_ROWS[1][field] },
    { k: 4, value: DATABASE_TABLE_ONE_ROWS[2][field] },
    { k: 8, value: DATABASE_TABLE_ONE_ROWS[3][field] },
  ];
  const x = Math.log2(k);

  for (let index = 0; index < points.length - 1; index += 1) {
    const left = points[index];
    const right = points[index + 1];

    if (k >= left.k && k <= right.k) {
      const fraction = (x - Math.log2(left.k)) / (Math.log2(right.k) - Math.log2(left.k));
      return left.value + ((right.value - left.value) * fraction);
    }
  }

  const last = points[points.length - 1];
  const floor = field === "collisionsPerRecord" ? 0.025 : 110;
  const extraDoublings = Math.log2(k / last.k);
  return floor + ((last.value - floor) * Math.exp(-0.75 * extraDoublings));
}

function databaseRowWithReductions(row, baseline) {
  const collisionReduction = baseline.collisionsPerRecord === 0
    ? 0
    : ((baseline.collisionsPerRecord - row.collisionsPerRecord) / baseline.collisionsPerRecord) * 100;
  const clusterReduction = baseline.maxCluster === 0
    ? 0
    : ((baseline.maxCluster - row.maxCluster) / baseline.maxCluster) * 100;

  return {
    ...row,
    collisionReduction,
    clusterReduction,
  };
}

function updateStegoSourceMode() {
  const usesFile = stegoMessageSourceInput.value === "file";
  stegoSequenceFileLabel.hidden = !usesFile;
  stegoSequenceFileInput.disabled = !usesFile;
}

async function calculateSteganography(progress = null) {
  try {
    setStegoStatus("Computing...");
    progress?.update(0.02, "Reading inputs");

    const sourceMode = stegoMessageSourceInput.value;
    const n = parseInteger(stegoLengthNInput.value, "N", 1);
    const k = parseInteger(stegoLengthKInput.value, "K", 0);
    const transformations = power(2, k);
    const insertedLength = n + k;
    const imageFile = stegoImageFileInput.files[0];
    const workSize = insertedLength * transformations;

    if (!Number.isSafeInteger(workSize) || workSize > 100000000) {
      throw new Error("The steganography workload is too large for an interactive browser run. Reduce N or K.");
    }

    if (!imageFile) {
      throw new Error("Select an image file.");
    }

    const imageData = await loadImagePixels(imageFile);
    progress?.update(0.1, "Preparing message");

    if (insertedLength > imageData.pixels.length) {
      throw new Error(`N+K must be at most the number of pixels in the image (${formatNumber(imageData.pixels.length)}).`);
    }

    let messageBits;

    if (sourceMode === "file") {
      const sequenceFile = stegoSequenceFileInput.files[0];

      if (!sequenceFile) {
        throw new Error("Select a sequence file when file mode is active.");
      }

      messageBits = await readMessageBitsFromFile(sequenceFile, n);
    } else {
      messageBits = generateRandomBits(n);
    }

    const analysis = await analyzeSteganographyPixelsAsync(imageData.pixels, messageBits, k, progress);
    progress?.update(0.98, "Rendering results");

    renderStegoSummary({
      imageSize: `${formatNumber(imageData.width)}x${formatNumber(imageData.height)}`,
      messageBits: insertedLength,
      bestKl: analysis.bestKl,
      state: "Completed",
      isError: false,
    });
    renderStegoMetrics({
      baselineKl: analysis.baselineKl,
      bestKl: analysis.bestKl,
      absoluteReduction: analysis.absoluteReduction,
      relativeReduction: analysis.relativeReduction,
    });
    stegoNote.textContent = analysis.bestTransformIndex === 0
      ? `No SST transformation improved the baseline over ${formatNumber(transformations)} transformations.`
      : `Best SST transformation found at index ${formatNumber(analysis.bestTransformIndex)} over ${formatNumber(transformations)} transformations.`;
  } catch (error) {
    renderStegoSummary({
      imageSize: "-",
      messageBits: "-",
      bestKl: "-",
      state: error.message,
      isError: true,
    });
    renderStegoMetrics(null);
    stegoNote.textContent = "Fix the parameters and try again.";
  }
}

function parseInteger(value, label, minimum) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < minimum) {
    throw new Error(`${label} must be an integer greater than or equal to ${minimum}.`);
  }

  return parsed;
}

function parseDecimal(value, label, minimum, maximum) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be a number between ${minimum} and ${maximum}.`);
  }

  return parsed;
}

function parseAlphabetSize(value, label) {
  return parseInteger(value, label, 2);
}

function buildAlphabet(size) {
  return Array.from({ length: size }, (_, index) => String(index));
}

function power(base, exponent) {
  const value = base ** exponent;

  if (!Number.isSafeInteger(value)) {
    throw new Error("The number of sequences exceeds the browser's safe integer precision.");
  }

  return value;
}

function buildRankedRows(alphabet, length, multiplier) {
  const rows = [];
  const counts = Array(alphabet.length).fill(0);
  const sequence = Array(length);

  function visit(position) {
    if (position === length) {
      const text = sequenceToText(alphabet, sequence);
      const entropy = empiricalEntropy(counts, length);
      rows.push({
        sequence: text,
        entropy,
        scaledEntropy: multiplier * entropy,
        frequencies: formatFrequencies(alphabet, counts, length),
      });
      return;
    }

    for (let index = 0; index < alphabet.length; index += 1) {
      sequence[position] = alphabet[index];
      counts[index] += 1;
      visit(position + 1);
      counts[index] -= 1;
    }
  }

  visit(0);
  return rows;
}

async function buildRankedRowsAsync(alphabet, length, multiplier, progressState) {
  const totalRows = power(alphabet.length, length);
  const rows = [];
  const counts = Array(alphabet.length);
  const sequence = Array(length);
  const yieldEvery = 1000;

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    counts.fill(0);
    let current = rowIndex;

    for (let position = length - 1; position >= 0; position -= 1) {
      const symbolIndex = current % alphabet.length;
      current = Math.floor(current / alphabet.length);
      sequence[position] = alphabet[symbolIndex];
      counts[symbolIndex] += 1;
    }

    const entropy = empiricalEntropy(counts, length);
    rows.push({
      sequence: sequenceToText(alphabet, sequence),
      entropy,
      scaledEntropy: multiplier * entropy,
      frequencies: formatFrequencies(alphabet, counts, length),
    });

    if (rowIndex % yieldEvery === 0) {
      progressState?.progress?.update(
        (progressState.offset + rowIndex) / progressState.total,
        progressState.phase,
      );
      await nextFrame();
    }
  }

  progressState?.progress?.update(
    (progressState.offset + totalRows) / progressState.total,
    progressState.phase,
  );

  return rows;
}

function randomSequenceIndices(symbolCount, length) {
  return Array.from({ length }, () => Math.floor(Math.random() * symbolCount));
}

function countsFromIndices(sequence, symbolCount) {
  const counts = Array(symbolCount).fill(0);

  sequence.forEach((symbolIndex) => {
    counts[symbolIndex] += 1;
  });

  return counts;
}

function generateRandomBits(length) {
  return Array.from({ length }, () => (Math.random() < 0.5 ? 0 : 1));
}

async function readMessageBitsFromFile(file, requiredLength) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder("utf-8").decode(bytes);
  let bits;

  if (/^[\s01]+$/.test(text) && /[01]/.test(text)) {
    bits = Array.from(text.matchAll(/[01]/g), (match) => Number(match[0]));
  } else {
    bits = [];
    bytes.forEach((byte) => {
      for (let bit = 7; bit >= 0; bit -= 1) {
        bits.push((byte >> bit) & 1);
      }
    });
  }

  if (bits.length < requiredLength) {
    throw new Error(`The selected file provides only ${formatNumber(bits.length)} bits, but N=${formatNumber(requiredLength)} is required.`);
  }

  return bits.slice(0, requiredLength);
}

async function loadImagePixels(file) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadHtmlImage(objectUrl);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("The browser could not create a canvas context for the selected image.");
    }
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = [];

    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      pixels.push(Math.round((0.299 * red) + (0.587 * green) + (0.114 * blue)));
    }

    return {
      width: canvas.width,
      height: canvas.height,
      pixels,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadHtmlImage(sourceUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be loaded."));
    image.src = sourceUrl;
  });
}

function analyzeSteganographyPixels(pixels, messageBits, k) {
  const originalCounts = pixelHistogram(pixels);
  const p = normalizeCounts(originalCounts);
  const baselinePayload = [...Array(k).fill(0), ...messageBits];
  const transformations = power(2, k);
  const baselineCounts = embeddedHistogramCounts(pixels, baselinePayload, originalCounts);
  const baselineKl = kullbackLeiblerDivergence(p, normalizeCounts(baselineCounts));
  let bestKl = baselineKl;
  let bestTransformIndex = 0;
  let bestPayload = baselinePayload;

  for (let transformIndex = 1; transformIndex < transformations; transformIndex += 1) {
    const payload = _z1(transformIndex, k, messageBits);
    const transformedCounts = embeddedHistogramCounts(pixels, payload, originalCounts);
    const currentKl = kullbackLeiblerDivergence(p, normalizeCounts(transformedCounts));

    if (currentKl < bestKl) {
      bestKl = currentKl;
      bestTransformIndex = transformIndex;
      bestPayload = payload;
    }
  }

  const absoluteReduction = baselineKl - bestKl;
  const relativeReduction = baselineKl === 0 ? 0 : (absoluteReduction / baselineKl) * 100;

  return {
    baselineKl,
    bestKl,
    absoluteReduction,
    relativeReduction,
    bestTransformIndex,
    bestPayload,
  };
}

async function analyzeSteganographyPixelsAsync(pixels, messageBits, k, progress = null) {
  const originalCounts = pixelHistogram(pixels);
  const p = normalizeCounts(originalCounts);
  const baselinePayload = [...Array(k).fill(0), ...messageBits];
  const transformations = power(2, k);
  const baselineCounts = embeddedHistogramCounts(pixels, baselinePayload, originalCounts);
  const baselineKl = kullbackLeiblerDivergence(p, normalizeCounts(baselineCounts));
  let bestKl = baselineKl;
  let bestTransformIndex = 0;
  let bestPayload = baselinePayload;
  const yieldEvery = Math.max(25, Math.floor(transformations / 160));

  for (let transformIndex = 1; transformIndex < transformations; transformIndex += 1) {
    const payload = _z1(transformIndex, k, messageBits);
    const transformedCounts = embeddedHistogramCounts(pixels, payload, originalCounts);
    const currentKl = kullbackLeiblerDivergence(p, normalizeCounts(transformedCounts));

    if (currentKl < bestKl) {
      bestKl = currentKl;
      bestTransformIndex = transformIndex;
      bestPayload = payload;
    }

    if (transformIndex % yieldEvery === 0) {
      progress?.update(0.1 + (0.88 * (transformIndex / transformations)), "SST transformations");
      await nextFrame();
    }
  }

  const absoluteReduction = baselineKl - bestKl;
  const relativeReduction = baselineKl === 0 ? 0 : (absoluteReduction / baselineKl) * 100;

  return {
    baselineKl,
    bestKl,
    absoluteReduction,
    relativeReduction,
    bestTransformIndex,
    bestPayload,
  };
}

function _z0(a,b){let c=Math.imul(a+0x9e3779b9,0x85ebca6b);c^=Math.imul(b+1,0xc2b2ae35);c^=c>>>16;c=Math.imul(c,0x7feb352d);c^=c>>>15;c=Math.imul(c,0x846ca68b);c^=c>>>16;return c&1}

function _z1(a,b,c){const d=Array(b).fill(0);let e=a;for(let f=b-1;f>=0;f-=1){d[f]=e&1;e=Math.floor(e/2)}for(let f=0;f<c.length;f+=1)d.push((c[f]+_z0(a,f))&1);return d}

function pixelHistogram(pixels) {
  const counts = Array(256).fill(0);
  pixels.forEach((value) => {
    counts[value] += 1;
  });
  return counts;
}

function normalizeCounts(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0);
  return counts.map((count) => count / total);
}

function embeddedHistogramCounts(pixels, messageBits, originalCounts) {
  const counts = originalCounts.slice();

  for (let index = 0; index < messageBits.length; index += 1) {
    const originalValue = pixels[index];
    const modifiedValue = (originalValue & 0xfe) | messageBits[index];

    if (modifiedValue !== originalValue) {
      counts[originalValue] -= 1;
      counts[modifiedValue] += 1;
    }
  }

  return counts;
}

function kullbackLeiblerDivergence(p, q) {
  const epsilon = 1e-10;
  let value = 0;

  for (let index = 0; index < p.length; index += 1) {
    const pValue = p[index] + epsilon;
    const qValue = q[index] + epsilon;
    value += pValue * Math.log2(pValue / qValue);
  }

  return value;
}

function mulberry32(seed) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function graphEdgeCapacity(nodeCount) {
  return (nodeCount * (nodeCount - 1)) / 2;
}

function binomial(n, k) {
  if (k < 0 || k > n) {
    return 0;
  }

  const r = Math.min(k, n - k);
  let value = 1;

  for (let index = 1; index <= r; index += 1) {
    value = (value * (n - r + index)) / index;
  }

  if (!Number.isSafeInteger(Math.round(value))) {
    throw new Error("The graph count exceeds the browser's safe integer precision.");
  }

  return Math.round(value);
}

function enumerateGraphMetrics(nodeCount, edgeCount) {
  const edgeList = buildGraphEdges(nodeCount);
  const adjacency = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(false));
  const degreeEntropies = [];
  const gapEntropies = [];
  const similarities = [];

  function visit(startIndex, chosenCount) {
    if (chosenCount === edgeCount) {
      degreeEntropies.push(degreeEntropyFromAdjacency(adjacency));
      gapEntropies.push(adjacencyGapEntropy(adjacency));
      similarities.push(averageJaccardSimilarity(adjacency));
      return;
    }

    const remaining = edgeCount - chosenCount;
    const lastStart = edgeList.length - remaining;

    for (let edgeIndex = startIndex; edgeIndex <= lastStart; edgeIndex += 1) {
      const [left, right] = edgeList[edgeIndex];
      adjacency[left][right] = true;
      adjacency[right][left] = true;
      visit(edgeIndex + 1, chosenCount + 1);
      adjacency[left][right] = false;
      adjacency[right][left] = false;
    }
  }

  visit(0, 0);
  return {
    degreeEntropies,
    gapEntropies,
    similarities,
  };
}

async function enumerateGraphMetricsAsync(nodeCount, edgeCount, progressState) {
  const edgeList = buildGraphEdges(nodeCount);
  const graphCount = binomial(edgeList.length, edgeCount);
  const degreeEntropies = [];
  const gapEntropies = [];
  const similarities = [];
  const yieldEvery = Math.max(25, Math.floor(graphCount / 160));

  if (edgeCount === 0) {
    const adjacency = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(false));
    degreeEntropies.push(degreeEntropyFromAdjacency(adjacency));
    gapEntropies.push(adjacencyGapEntropy(adjacency));
    similarities.push(averageJaccardSimilarity(adjacency));
    progressState?.progress?.update(
      (progressState.offset + 1) / progressState.total,
      progressState.phase,
    );
    return {
      degreeEntropies,
      gapEntropies,
      similarities,
    };
  }

  const combination = Array.from({ length: edgeCount }, (_, index) => index);
  let processed = 0;

  while (combination) {
    const adjacency = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(false));

    combination.forEach((edgeIndex) => {
      const [left, right] = edgeList[edgeIndex];
      adjacency[left][right] = true;
      adjacency[right][left] = true;
    });

    degreeEntropies.push(degreeEntropyFromAdjacency(adjacency));
    gapEntropies.push(adjacencyGapEntropy(adjacency));
    similarities.push(averageJaccardSimilarity(adjacency));
    processed += 1;

    if (processed % yieldEvery === 0) {
      progressState?.progress?.update(
        (progressState.offset + processed) / progressState.total,
        progressState.phase,
      );
      await nextFrame();
    }

    if (!advanceCombination(combination, edgeList.length)) {
      break;
    }
  }

  progressState?.progress?.update(
    (progressState.offset + processed) / progressState.total,
    progressState.phase,
  );

  return {
    degreeEntropies,
    gapEntropies,
    similarities,
  };
}

function advanceCombination(combination, itemCount) {
  for (let index = combination.length - 1; index >= 0; index -= 1) {
    const maximum = itemCount - combination.length + index;

    if (combination[index] < maximum) {
      combination[index] += 1;

      for (let next = index + 1; next < combination.length; next += 1) {
        combination[next] = combination[next - 1] + 1;
      }

      return true;
    }
  }

  return false;
}

function buildGraphEdges(nodeCount) {
  const edges = [];

  for (let left = 0; left < nodeCount - 1; left += 1) {
    for (let right = left + 1; right < nodeCount; right += 1) {
      edges.push([left, right]);
    }
  }

  return edges;
}

function generateRandomGraphEdges(nodeCount, edgeCount) {
  const edges = buildGraphEdges(nodeCount);

  for (let index = 0; index < edgeCount; index += 1) {
    const swapIndex = index + Math.floor(Math.random() * (edges.length - index));
    [edges[index], edges[swapIndex]] = [edges[swapIndex], edges[index]];
  }

  return edges.slice(0, edgeCount).map(([left, right]) => [left, right]);
}

function parseGraphFile(text) {
  const edgeCandidates = [];
  let declaredNodeCount = null;

  text.split(/\r?\n/).forEach((rawLine, lineIndex) => {
    const line = rawLine.replace(/#.*/, "").trim();

    if (!line) {
      return;
    }

    const nodeCountMatch = line.match(/^(?:nodes?|n|nd)\s*[:=]?\s*(\d+)$/i);

    if (nodeCountMatch) {
      declaredNodeCount = parseInteger(nodeCountMatch[1], "nodes", 1);
      return;
    }

    const values = line.match(/-?\d+/g);

    if (!values || values.length < 2) {
      throw new Error(`Invalid graph file line ${lineIndex + 1}. Use one edge per line, for example "1 2".`);
    }

    const left = Number(values[0]);
    const right = Number(values[1]);

    if (!Number.isInteger(left) || !Number.isInteger(right) || left < 0 || right < 0) {
      throw new Error(`Invalid node index on line ${lineIndex + 1}. Node indexes must be non-negative integers.`);
    }

    edgeCandidates.push([left, right]);
  });

  if (edgeCandidates.length === 0 && declaredNodeCount === null) {
    throw new Error("The graph file does not contain any edges or node count.");
  }

  const hasZeroIndex = edgeCandidates.some(([left, right]) => left === 0 || right === 0);
  const offset = hasZeroIndex ? 0 : 1;
  const edgeMap = new Map();
  let maximumNodeIndex = -1;

  edgeCandidates.forEach(([rawLeft, rawRight]) => {
    const left = rawLeft - offset;
    const right = rawRight - offset;

    if (left < 0 || right < 0 || left === right) {
      return;
    }

    const normalized = normalizeEdge(left, right);
    maximumNodeIndex = Math.max(maximumNodeIndex, normalized[0], normalized[1]);
    edgeMap.set(edgeKey(normalized[0], normalized[1]), normalized);
  });

  const inferredNodeCount = maximumNodeIndex + 1;
  const nodeCount = Math.max(declaredNodeCount || 0, inferredNodeCount);

  if (nodeCount < 1) {
    throw new Error("The graph file must describe at least one node.");
  }

  return {
    nodeCount,
    edges: Array.from(edgeMap.values()),
  };
}

function edgeListToAdjacency(edges, nodeCount) {
  const adjacency = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(false));

  edges.forEach(([left, right]) => {
    if (left === right || left < 0 || right < 0 || left >= nodeCount || right >= nodeCount) {
      return;
    }

    adjacency[left][right] = true;
    adjacency[right][left] = true;
  });

  return adjacency;
}

function transformRandomGraphEdges(edges, originalNodes, expandedNodes, firstNode, secondNode) {
  const transformed = new Map();
  const shift = ((firstNode + secondNode) % expandedNodes) + 1;

  edges.forEach(([left, right]) => {
    let transformedLeft = (left + shift) % expandedNodes;
    let transformedRight = (right + shift) % expandedNodes;

    if (transformedLeft === transformedRight) {
      transformedRight = (transformedRight + 1) % expandedNodes;
    }

    addEdgeToMap(transformed, transformedLeft, transformedRight);
  });

  let extraLeft = Math.min(firstNode, secondNode);
  let extraRight = Math.max(firstNode, secondNode);

  if (extraLeft === extraRight) {
    extraRight = (extraRight + 1) % originalNodes;
    [extraLeft, extraRight] = normalizeEdge(extraLeft, extraRight);
  }

  if (transformed.has(edgeKey(extraLeft, extraRight))) {
    const freeEdge = findFirstFreeOriginalEdge(transformed, originalNodes);

    if (freeEdge) {
      [extraLeft, extraRight] = freeEdge;
    }
  }

  addEdgeToMap(transformed, extraLeft, extraRight);
  return Array.from(transformed.values());
}

function findFirstFreeOriginalEdge(edgeMap, nodeCount) {
  for (let left = 0; left < nodeCount - 1; left += 1) {
    for (let right = left + 1; right < nodeCount; right += 1) {
      if (!edgeMap.has(edgeKey(left, right))) {
        return [left, right];
      }
    }
  }

  return null;
}

function addEdgeToMap(edgeMap, left, right) {
  const normalized = normalizeEdge(left, right);
  edgeMap.set(edgeKey(normalized[0], normalized[1]), normalized);
}

function normalizeEdge(left, right) {
  return left < right ? [left, right] : [right, left];
}

function edgeKey(left, right) {
  return `${left}:${right}`;
}

function degreeEntropyFromAdjacency(adjacency) {
  const degrees = adjacency.map((row) => row.reduce((sum, isEdge) => sum + (isEdge ? 1 : 0), 0));
  return degreeEntropyFromDegrees(degrees);
}

function degreeEntropyFromDegrees(degrees) {
  const counts = new Map();

  degrees.forEach((degree) => {
    counts.set(degree, (counts.get(degree) || 0) + 1);
  });

  let entropy = 0;
  counts.forEach((count) => {
    const probability = count / degrees.length;
    entropy -= probability * Math.log2(probability);
  });

  return entropy;
}

function adjacencyGapEntropy(adjacency) {
  const nodeCount = adjacency.length;
  const gaps = [];

  adjacency.forEach((row) => {
    const neighbors = [];

    row.forEach((isEdge, index) => {
      if (isEdge) {
        neighbors.push(index + 1);
      }
    });

    if (neighbors.length === 0) {
      return;
    }

    gaps.push(neighbors[0]);

    for (let index = 1; index < neighbors.length; index += 1) {
      gaps.push(neighbors[index] - neighbors[index - 1]);
    }
  });

  if (gaps.length === 0) {
    return 0;
  }

  const counts = Array(nodeCount).fill(0);
  gaps.forEach((gap) => {
    counts[gap - 1] += 1;
  });

  return empiricalEntropy(counts, gaps.length);
}

function averageJaccardSimilarity(adjacency) {
  const nodeCount = adjacency.length;

  if (nodeCount < 2) {
    return 1;
  }

  let sum = 0;
  let pairCount = 0;

  for (let left = 0; left < nodeCount - 1; left += 1) {
    for (let right = left + 1; right < nodeCount; right += 1) {
      let intersection = 0;
      let union = 0;

      for (let index = 0; index < nodeCount; index += 1) {
        const hasLeft = adjacency[left][index];
        const hasRight = adjacency[right][index];

        if (hasLeft && hasRight) {
          intersection += 1;
        }

        if (hasLeft || hasRight) {
          union += 1;
        }
      }

      sum += union === 0 ? 1 : intersection / union;
      pairCount += 1;
    }
  }

  return sum / pairCount;
}

function selectLowestValues(values, count) {
  return values.slice().sort((left, right) => left - right).slice(0, count);
}

function selectHighestValues(values, count) {
  return values.slice().sort((left, right) => right - left).slice(0, count);
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageMappingScores(mapping) {
  if (mapping.length === 0) {
    return {
      sourceScore: 0,
      targetScore: 0,
      gain: 0,
    };
  }

  const totals = mapping.reduce((accumulator, row) => {
    accumulator.sourceScore += row.source.scaledEntropy;
    accumulator.targetScore += row.target.scaledEntropy;
    return accumulator;
  }, {
    sourceScore: 0,
    targetScore: 0,
  });
  const sourceScore = totals.sourceScore / mapping.length;
  const targetScore = totals.targetScore / mapping.length;

  return {
    sourceScore,
    targetScore,
    gain: sourceScore - targetScore,
  };
}

function prefixFromNumber(value, symbolCount, length) {
  const prefix = Array(length).fill(0);
  let current = value;

  for (let index = length - 1; index >= 0; index -= 1) {
    prefix[index] = current % symbolCount;
    current = Math.floor(current / symbolCount);
  }

  return prefix;
}

function scoreTransformedSequence(source, prefix, transformIndex, symbolCount, n, k) {
  const totalLength = n + k;
  const counts = Array(symbolCount).fill(0);

  prefix.forEach((symbolIndex) => {
    counts[symbolIndex] += 1;
  });

  source.forEach((symbolIndex, position) => {
    const shift = modifierSymbol(transformIndex, position, symbolCount);
    const transformedIndex = (symbolIndex + shift) % symbolCount;
    counts[transformedIndex] += 1;
  });

  const entropy = empiricalEntropy(counts, totalLength);

  return {
    entropy,
    score: totalLength * entropy,
  };
}

function modifierSymbol(transformIndex, position, symbolCount) {
  if (transformIndex === 0) {
    return 0;
  }

  let value = Math.imul(transformIndex + 0x9e3779b9, 0x85ebca6b);
  value ^= Math.imul(position + 1, 0xc2b2ae35);
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;

  return (value >>> 0) % symbolCount;
}

function prefixToText(alphabet, prefix) {
  if (prefix.length === 0) {
    return "(empty)";
  }

  return sequenceToText(alphabet, prefix.map((symbolIndex) => alphabet[symbolIndex]));
}

function sequenceToText(alphabet, sequence) {
  const hasLongSymbols = alphabet.some((symbol) => symbol.length > 1);
  return hasLongSymbols ? sequence.join(" ") : sequence.join("");
}

function empiricalEntropy(counts, length) {
  if (length === 0) {
    return 0;
  }

  return counts.reduce((sum, count) => {
    if (count === 0) {
      return sum;
    }

    const probability = count / length;
    return sum - probability * Math.log2(probability);
  }, 0);
}

function formatFrequencies(alphabet, counts, length) {
  return alphabet
    .map((symbol, index) => {
      const probability = length === 0 ? 0 : counts[index] / length;
      return `${symbol}:${counts[index]}/${length}=${formatDecimal(probability)}`;
    })
    .join(" | ");
}

function compareRows(left, right) {
  if (left.scaledEntropy !== right.scaledEntropy) {
    return left.scaledEntropy - right.scaledEntropy;
  }

  return left.sequence.localeCompare(right.sequence, "en");
}

function renderSummary({ sourceCount, expandedCount, mappingCount, state, isError }) {
  const values = summary.querySelectorAll("dd");
  values[0].textContent = typeof sourceCount === "number" ? formatNumber(sourceCount) : sourceCount;
  values[1].textContent = typeof expandedCount === "number" ? formatNumber(expandedCount) : expandedCount;
  values[2].textContent = typeof mappingCount === "number" ? formatNumber(mappingCount) : mappingCount;
  values[3].textContent = state;
  values[3].classList.toggle("error", isError);
}

function setStatus(state) {
  const values = summary.querySelectorAll("dd");
  values[3].textContent = state;
  values[3].classList.remove("error");
}

function renderTablesMetrics(averages) {
  const values = tablesMetrics.querySelectorAll("strong");

  if (!averages) {
    values.forEach((value) => {
      value.textContent = "-";
    });
    return;
  }

  values[0].textContent = formatDecimal(averages.sourceScore);
  values[1].textContent = formatDecimal(averages.targetScore);
  values[2].textContent = formatDecimal(averages.gain);
}

function renderPreview(mapping) {
  mappingBody.innerHTML = mapping.map((row) => `
    <tr>
      <td>${row.rank}</td>
      <td>${escapeHtml(row.source.sequence)}</td>
      <td>${formatDecimal(row.source.scaledEntropy)}</td>
      <td>${escapeHtml(row.target.sequence)}</td>
      <td>${formatDecimal(row.target.scaledEntropy)}</td>
    </tr>
  `).join("");
}

function renderEmpty(message, isError = false) {
  mappingBody.innerHTML = `
    <tr>
      <td colspan="5" class="${isError ? "error" : ""}">${escapeHtml(message)}</td>
    </tr>
  `;
}

function renderApproxSummary({ h, transformsPerSequence, gain, state, isError }) {
  const values = approxSummary.querySelectorAll("dd");
  values[0].textContent = typeof h === "number" ? formatNumber(h) : h;
  values[1].textContent = typeof transformsPerSequence === "number" ? formatNumber(transformsPerSequence) : transformsPerSequence;
  values[2].textContent = typeof gain === "number" ? formatDecimal(gain) : gain;
  values[3].textContent = state;
  values[3].classList.toggle("error", isError);
}

function setApproxStatus(state) {
  const values = approxSummary.querySelectorAll("dd");
  values[3].textContent = state;
  values[3].classList.remove("error");
}

function renderApproxMetrics(averages) {
  const values = approxMetrics.querySelectorAll("strong");

  if (!averages) {
    values.forEach((value) => {
      value.textContent = "-";
    });
    return;
  }

  values[0].textContent = formatDecimal(averages.sourceScore);
  values[1].textContent = formatDecimal(averages.bestScore);
  values[2].textContent = formatDecimal(averages.gain);
}

function renderGraphySummary({ count1, count2, scoreDifference, state, isError }) {
  const values = graphySummary.querySelectorAll("dd");
  values[0].textContent = typeof count1 === "number" ? formatNumber(count1) : count1;
  values[1].textContent = typeof count2 === "number" ? formatNumber(count2) : count2;
  values[2].textContent = typeof scoreDifference === "number" ? formatDecimal(scoreDifference) : scoreDifference;
  values[3].textContent = state;
  values[3].classList.toggle("error", isError);
}

function setGraphyStatus(state) {
  const values = graphySummary.querySelectorAll("dd");
  values[3].textContent = state;
  values[3].classList.remove("error");
}

function renderGraphyMetrics(metrics) {
  const values = graphyMetrics.querySelectorAll("strong");

  if (!metrics) {
    values.forEach((value) => {
      value.textContent = "-";
    });
    return;
  }

  values[0].textContent = formatDecimal(metrics.meanOriginalDegreeEntropy);
  values[1].textContent = formatDecimal(metrics.meanSelectedDegreeEntropy);
  values[2].textContent = formatDecimal(metrics.degreeEntropyDifference);
  values[3].textContent = formatDecimal(metrics.meanOriginalDegreeScore);
  values[4].textContent = formatDecimal(metrics.meanSelectedDegreeScore);
  values[5].textContent = formatDecimal(metrics.degreeScoreDifference);
  values[6].textContent = formatDecimal(metrics.meanOriginalGapEntropy);
  values[7].textContent = formatDecimal(metrics.meanSelectedGapEntropy);
  values[8].textContent = formatDecimal(metrics.gapEntropyDifference);
  values[9].textContent = formatDecimal(metrics.meanOriginalGapScore);
  values[10].textContent = formatDecimal(metrics.meanSelectedGapScore);
  values[11].textContent = formatDecimal(metrics.gapScoreDifference);
  values[12].textContent = formatDecimal(metrics.meanOriginalSimilarity);
  values[13].textContent = formatDecimal(metrics.meanSelectedSimilarity);
  values[14].textContent = formatDecimal(metrics.similarityGain);
}

function renderRandomGraphSummary({ h, transformsPerGraph, degreeGain, state, isError }) {
  const values = randomGraphSummary.querySelectorAll("dd");
  values[0].textContent = typeof h === "number" ? formatNumber(h) : h;
  values[1].textContent = typeof transformsPerGraph === "number" ? formatNumber(transformsPerGraph) : transformsPerGraph;
  values[2].textContent = typeof degreeGain === "number" ? formatDecimal(degreeGain) : degreeGain;
  values[3].textContent = state;
  values[3].classList.toggle("error", isError);
}

function setRandomGraphStatus(state) {
  const values = randomGraphSummary.querySelectorAll("dd");
  values[3].textContent = state;
  values[3].classList.remove("error");
}

function renderRandomGraphMetrics(metrics) {
  const values = randomGraphMetrics.querySelectorAll("strong");

  if (!metrics) {
    values.forEach((value) => {
      value.textContent = "-";
    });
    return;
  }

  values[0].textContent = formatDecimal(metrics.meanOriginalDegreeEntropy);
  values[1].textContent = formatDecimal(metrics.meanBestDegreeEntropy);
  values[2].textContent = formatDecimal(metrics.degreeEntropyGain);
  values[3].textContent = formatDecimal(metrics.meanOriginalGapEntropy);
  values[4].textContent = formatDecimal(metrics.meanBestGapEntropy);
  values[5].textContent = formatDecimal(metrics.gapEntropyGain);
  values[6].textContent = formatDecimal(metrics.meanOriginalSimilarity);
  values[7].textContent = formatDecimal(metrics.meanBestSimilarity);
  values[8].textContent = formatDecimal(metrics.similarityGain);
}

function renderLoadedGraphPreview(preview) {
  if (!randomGraphLoadedPreviewSection || !randomGraphLoadedPreview || !randomGraphLoadedNote) {
    return;
  }

  if (!preview) {
    randomGraphLoadedPreviewSection.hidden = true;
    randomGraphLoadedPreview.innerHTML = "";
    randomGraphLoadedNote.textContent = "The loaded graph will appear here after running the file mode.";
    return;
  }

  const { original, degree, gap, similarity } = preview;
  randomGraphLoadedPreviewSection.hidden = false;
  randomGraphLoadedNote.textContent = `${formatNumber(original.nodeCount)} nodes and ${formatNumber(original.edges.length)} edges were read from the file. The transformed graphs are selected by minimum \\(H_d\\), minimum \\(H_{\\mathrm{gap}}\\), and maximum \\(S_J\\).`;

  if (original.nodeCount > 80 || degree.nodeCount > 80 || gap.nodeCount > 80 || similarity.nodeCount > 80) {
    randomGraphLoadedPreview.innerHTML = `
      <p>The graph is too large for a readable drawing. The file was parsed successfully.</p>
      <div class="graph-preview-grid">
        ${createGraphPreviewBlock("Original graph", original, false)}
        ${createGraphPreviewBlock("Transformed graph for minimum \\(H_d\\)", degree, false)}
        ${createGraphPreviewBlock("Transformed graph for minimum \\(H_{\\mathrm{gap}}\\)", gap, false)}
        ${createGraphPreviewBlock("Transformed graph for maximum \\(S_J\\)", similarity, false)}
      </div>
    `;
    typesetMath(randomGraphLoadedPreviewSection);
    return;
  }

  randomGraphLoadedPreview.innerHTML = `
    <div class="graph-preview-grid">
      ${createGraphPreviewBlock("Original graph", original, true)}
      ${createGraphPreviewBlock("Transformed graph for minimum \\(H_d\\)", degree, true)}
      ${createGraphPreviewBlock("Transformed graph for minimum \\(H_{\\mathrm{gap}}\\)", gap, true)}
      ${createGraphPreviewBlock("Transformed graph for maximum \\(S_J\\)", similarity, true)}
    </div>
  `;
  typesetMath(randomGraphLoadedPreviewSection);
}

function createGraphPreviewBlock(title, graph, includeSvg) {
  return `
    <article class="graph-preview-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${formatNumber(graph.nodeCount)} nodes, ${formatNumber(graph.edges.length)} edges</p>
      ${includeSvg ? createGraphPreviewSvg(graph.nodeCount, graph.edges, title) : ""}
      <pre><code>${escapeHtml(formatEdgeListPreview(graph.edges))}</code></pre>
    </article>
  `;
}

function createGraphPreviewSvg(nodeCount, edges, title) {
  const size = 520;
  const center = size / 2;
  const radius = nodeCount <= 1 ? 0 : 190;
  const nodes = Array.from({ length: nodeCount }, (_, index) => {
    const angle = (-Math.PI / 2) + ((2 * Math.PI * index) / Math.max(1, nodeCount));
    return {
      label: String(index + 1),
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  const edgeLines = edges.map(([left, right]) => {
    const source = nodes[left];
    const target = nodes[right];

    if (!source || !target) {
      return "";
    }

    return `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}"></line>`;
  }).join("");
  const nodeCircles = nodes.map((node) => `
    <g>
      <circle cx="${node.x}" cy="${node.y}" r="18"></circle>
      <text x="${node.x}" y="${node.y}">${escapeHtml(node.label)}</text>
    </g>
  `).join("");

  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeHtml(title)} with ${nodeCount} nodes and ${edges.length} edges">
      <g class="graph-preview-edges">${edgeLines}</g>
      <g class="graph-preview-nodes">${nodeCircles}</g>
    </svg>
  `;
}

function formatEdgeListPreview(edges) {
  const previewLimit = 80;
  const shownEdges = edges.slice(0, previewLimit).map(([left, right]) => `${left + 1} ${right + 1}`);
  const remaining = edges.length - shownEdges.length;

  if (remaining > 0) {
    shownEdges.push(`... ${remaining} more edges`);
  }

  return shownEdges.join("\n");
}

function renderDatabaseSummary({ k, loadFactor, queryMode, queryMultiplier, state, isError }) {
  const values = databaseSummary.querySelectorAll("dd");
  values[0].textContent = typeof k === "number" ? formatNumber(k) : k;
  values[1].textContent = typeof loadFactor === "number" ? formatDecimal(loadFactor) : loadFactor;
  values[2].textContent = queryMode;
  values[3].textContent = typeof queryMultiplier === "number" ? formatNumber(queryMultiplier) : queryMultiplier;
  values[4].textContent = state;
  values[4].classList.toggle("error", isError);
}

function setDatabaseStatus(state) {
  const values = databaseSummary.querySelectorAll("dd");
  values[4].textContent = state;
  values[4].classList.remove("error");
}

function renderDatabaseMetrics(metrics) {
  const values = databaseMetrics.querySelectorAll("strong");

  if (!metrics) {
    values.forEach((value) => {
      value.textContent = "-";
    });
    return;
  }

  values[0].textContent = `${formatDecimal(metrics.bestCollisionReduction)}%`;
  values[1].textContent = `${formatDecimal(metrics.bestClusterReduction)}%`;
  values[2].textContent = metrics.bestConfiguration;
}

function renderDatabaseRows(rows) {
  databaseBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.configuration)}</td>
      <td>${formatNumber(row.metadataBits)}</td>
      <td>${formatDecimal(row.collisionsPerRecord)}</td>
      <td>${formatDecimal(row.maxCluster)}</td>
      <td>${formatDecimal(row.collisionReduction)}%</td>
      <td>${formatDecimal(row.clusterReduction)}%</td>
    </tr>
  `).join("");
}

function renderDatabaseEmpty(message, isError = false) {
  databaseBody.innerHTML = `
    <tr>
      <td colspan="6" class="${isError ? "error" : ""}">${escapeHtml(message)}</td>
    </tr>
  `;
}

function renderStegoSummary({ imageSize, messageBits, bestKl, state, isError }) {
  const values = stegoSummary.querySelectorAll("dd");
  values[0].textContent = imageSize;
  values[1].textContent = typeof messageBits === "number" ? formatNumber(messageBits) : messageBits;
  values[2].textContent = typeof bestKl === "number" ? formatScientific(bestKl) : bestKl;
  values[3].textContent = state;
  values[3].classList.toggle("error", isError);
}

function setStegoStatus(state) {
  const values = stegoSummary.querySelectorAll("dd");
  values[3].textContent = state;
  values[3].classList.remove("error");
}

function renderStegoMetrics(metrics) {
  const values = stegoMetrics.querySelectorAll("strong");

  if (!metrics) {
    values.forEach((value) => {
      value.textContent = "-";
    });
    return;
  }

  values[0].textContent = formatScientific(metrics.baselineKl);
  values[1].textContent = formatScientific(metrics.bestKl);
  values[2].textContent = formatScientific(metrics.absoluteReduction);
  values[3].textContent = `${formatDecimal(metrics.relativeReduction)}%`;
}

function downloadExcel(result) {
  const mappingRows = [
    [
      "Rank",
      "Source sequence",
      "Source H0",
      "Source N*H0",
      "Expanded sequence",
      "Expanded H0",
      "Expanded (N+K)*H0",
    ],
    ...result.mapping.map((row) => [
      row.rank,
      row.source.sequence,
      formatDecimal(row.source.entropy),
      formatDecimal(row.source.scaledEntropy),
      row.target.sequence,
      formatDecimal(row.target.entropy),
      formatDecimal(row.target.scaledEntropy),
    ]),
  ];

  const metadata = [
    ["Parameter", "Value"],
    ["Author", "Set shaping theory Simulator"],
    ["Alphabet", result.alphabet.join(", ")],
    ["N", result.n],
    ["K", result.k],
    ["Source sequences", result.sourceRows.length],
    ["Selected expanded sequences", result.selectedExpandedRows.length],
    ["Generated at", result.generatedAt.toLocaleString("en-US")],
    [],
  ];

  const workbookRows = [...metadata, ...mappingRows];
  const workbookBytes = createXlsx(workbookRows, result.generatedAt);
  const blob = new Blob([workbookBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  const filename = `set-shaping-A${result.alphabet.length}-N${result.n}-K${result.k}.xlsx`;
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function downloadGraphExampleFile() {
  const content = [
    "# Example graph file for the SST graph section",
    "nodes: 5",
    "1 2",
    "1 3",
    "2 4",
    "4 5",
  ].join("\n");
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "example_graph_edge_list.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function createXlsx(rows, generatedAt) {
  const createdAt = generatedAt.toISOString();
  const files = [
    {
      path: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    },
    {
      path: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      path: "docProps/core.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Set shaping theory Simulator</dc:creator>
  <cp:lastModifiedBy>Set shaping theory Simulator</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
</cp:coreProperties>`,
    },
    {
      path: "docProps/app.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Set Shaping Mapper</Application>
</Properties>`,
    },
    {
      path: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Mapping" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    },
    {
      path: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    },
    {
      path: "xl/worksheets/sheet1.xml",
      content: createWorksheetXml(rows),
    },
  ];

  return createZip(files);
}

function createWorksheetXml(rows) {
  const sheetData = rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cells = row.map((cell, columnIndex) => {
      const reference = `${columnName(columnIndex)}${rowNumber}`;
      return createCellXml(reference, cell);
    }).join("");

    return `<row r="${rowNumber}">${cells}</row>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetData}</sheetData>
</worksheet>`;
}

function createCellXml(reference, value) {
  if (value === null || value === undefined || value === "") {
    return `<c r="${reference}"/>`;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${reference}"><v>${value}</v></c>`;
  }

  return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(String(value))}</t></is></c>`;
}

function columnName(index) {
  let name = "";
  let value = index + 1;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }

  return name;
}

function createZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.path);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);
    const localHeader = zipLocalHeader(nameBytes, dataBytes, crc);
    const centralHeader = zipCentralHeader(nameBytes, dataBytes, crc, offset);

    localParts.push(localHeader, nameBytes, dataBytes);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + dataBytes.length;
  });

  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = zipEndRecord(files.length, centralSize, centralOffset);

  return concatUint8Arrays([...localParts, ...centralParts, endRecord]);
}

function zipLocalHeader(nameBytes, dataBytes, crc) {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, dataBytes.length, true);
  view.setUint32(22, dataBytes.length, true);
  view.setUint16(26, nameBytes.length, true);
  view.setUint16(28, 0, true);
  return header;
}

function zipCentralHeader(nameBytes, dataBytes, crc, offset) {
  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, dataBytes.length, true);
  view.setUint32(24, dataBytes.length, true);
  view.setUint16(28, nameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  return header;
}

function zipEndRecord(fileCount, centralSize, centralOffset) {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, fileCount, true);
  view.setUint16(10, fileCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return record;
}

function concatUint8Arrays(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });

  return result;
}

function crc32(bytes) {
  const table = crc32.table || (crc32.table = createCrc32Table());
  let crc = 0xffffffff;

  bytes.forEach((byte) => {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  });

  return (crc ^ 0xffffffff) >>> 0;
}

function createCrc32Table() {
  return Array.from({ length: 256 }, (_, index) => {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    return value >>> 0;
  });
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDecimal(value) {
  return Number(value).toFixed(6);
}

function formatScientific(value) {
  return Number(value).toExponential(6);
}

function formatDuration(milliseconds) {
  const seconds = Math.max(1, Math.round(milliseconds / 1000));

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

updateRandomGraphSourceMode();
updateStegoSourceMode();
showView("home-view");
