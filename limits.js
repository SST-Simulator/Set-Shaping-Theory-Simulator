"use strict";

const RL_FUNCTIONS = {
  h0: "F1: Empirical entropy",
  kt: "F2: Universal KT cost",
  h1: "F3: First-order entropy",
  kl: "F4: KL divergence, geometric Q",
  gap: "F5a: Logarithmic gap cost",
  gapEntropy: "F5b: Empirical gap entropy",
  type: "Log type-class size",
  renyiHalf: "Renyi entropy, order 1/2",
  renyi2: "Renyi entropy, order 2",
  renyiInfinity: "Renyi min-entropy",
  klUniform: "KL divergence, uniform Q",
  klIncreasing: "KL divergence, increasing Q",
  crossUniform: "Cross-entropy, uniform Q",
  crossIncreasing: "Cross-entropy, increasing Q",
  crossGeometric: "Cross-entropy, geometric Q",
  nml: "Normalized maximum likelihood",
  h2: "Second-order conditional entropy",
  varentropy: "Cumulative varentropy",
  mutual: "Adjacent mutual information",
  pearson: "Pearson statistic, uniform Q",
  chernoff: "Chernoff information, uniform Q",
  tv: "Product total variation, uniform Q",
  rd05: "Rate-distortion, delta = 0.05",
  rd10: "Rate-distortion, delta = 0.10",
  rd20: "Rate-distortion, delta = 0.20",
};

const RL_SYMMETRIC = new Set([
  "h0", "kt", "type", "renyiHalf", "renyi2", "renyiInfinity", "klUniform",
  "crossUniform", "nml", "varentropy", "pearson", "chernoff", "tv", "rd05", "rd10", "rd20",
]);

function rlUnit(key) {
  return key === "varentropy" ? "bits²" : ["pearson", "tv"].includes(key) ? "dimensionless" : "bits";
}

// Hamming rate-distortion has a reverse-water-filling solution on the active support.
function rlRateDistortion(counts, n, delta) {
  const p = Array.from(counts).filter(Boolean).map(c => c / n).sort((x, y) => y - x);
  if (delta >= 1 - p[0]) return 0;
  for (let m = 2; m <= p.length; m++) {
    const mass = p.slice(0, m).reduce((sum, value) => sum + value, 0);
    const threshold = (delta - (1 - mass)) / (m - 1);
    if (threshold < 0 || threshold > p[m - 1] + 1e-14 ||
        (m < p.length && threshold < p[m] - 1e-14)) continue;
    let value = (1 - delta) * Math.log2(1 - delta);
    if (threshold > 0) value += (m - 1) * threshold * Math.log2(threshold);
    for (let i = 0; i < m; i++) value -= p[i] * Math.log2(p[i]);
    return Math.max(0, n * value);
  }
  throw new Error("Rate-distortion threshold could not be resolved.");
}

function rlProductTv(counts, n, a) {
  const groups = new Map();
  for (const count of counts) if (count) groups.set(count, (groups.get(count) || 0) + 1);
  const entries = Array.from(groups);
  const logFactorial = [0];
  for (let i = 1; i <= n; i++) logFactorial[i] = logFactorial[i - 1] + Math.log2(i);
  let overlap = 0;
  function visit(index, remaining, logMass, logRatio, denominator) {
    const [count, multiplicity] = entries[index];
    const p = count / n;
    const logGroup = Math.log2(multiplicity * p);
    const logQoverP = -Math.log2(a * p);
    if (index === entries.length - 1) {
      const logProbability = logFactorial[n] - denominator - logFactorial[remaining] + logMass + remaining * logGroup;
      overlap += 2 ** (logProbability + Math.min(0, logRatio + remaining * logQoverP));
      return;
    }
    for (let next = 0; next <= remaining; next++) {
      visit(index + 1, remaining - next, logMass + next * logGroup,
        logRatio + next * logQoverP, denominator + logFactorial[next]);
    }
  }
  visit(0, n, 0, 0, 0);
  return Math.max(0, Math.min(1, 1 - overlap));
}

function rlScalarCost(counts, n, a, key, entropy) {
  const h0 = entropy ?? rlEntropyCost(counts, n);
  const p = Array.from(counts, c => c / n);
  if (key === "type") {
    const factorial = rlFactorials(n);
    return Math.log2(Number(factorial[n] / Array.from(counts).reduce((d, c) => d * factorial[c], 1n)));
  }
  if (key === "renyiHalf") return 2 * n * Math.log2(p.reduce((sum, x) => sum + Math.sqrt(x), 0));
  if (key === "renyi2") return -n * Math.log2(p.reduce((sum, x) => sum + x * x, 0));
  if (key === "renyiInfinity") return -n * Math.log2(Math.max(...p));
  if (key === "klUniform") return Math.max(0, n * Math.log2(a) - h0);
  if (key === "crossUniform") return n * Math.log2(a);
  if (key === "varentropy") return p.reduce((sum, x) => x ? sum + n * x * (-Math.log2(x) - h0 / n) ** 2 : sum, 0);
  if (key === "pearson") return n * (a * p.reduce((sum, x) => sum + x * x, 0) - 1);
  if (key === "chernoff") {
    const active = p.filter(x => x > 0);
    const cost = t => active.reduce((sum, x) => sum + x ** t * (1 / a) ** (1 - t), 0);
    let low = 0, high = 1;
    for (let i = 0; i < 70; i++) {
      const left = low + (high - low) / 3, right = high - (high - low) / 3;
      if (cost(left) < cost(right)) high = right; else low = left;
    }
    return Math.max(0, -n * Math.log2(Math.min(cost(0), cost(1), cost((low + high) / 2))));
  }
  if (key === "tv") return rlProductTv(counts, n, a);
  if (key.startsWith("rd")) return rlRateDistortion(counts, n, { rd05: 0.05, rd10: 0.10, rd20: 0.20 }[key]);
  if (["klIncreasing", "crossIncreasing", "crossGeometric"].includes(key)) {
    let cross = 0;
    for (let i = 0; i < a; i++) {
      const q = key === "crossGeometric" ? 2 ** i / (2 ** a - 1) : (i + 1) / (a * (a + 1) / 2);
      cross -= counts[i] * Math.log2(q);
    }
    return key === "klIncreasing" ? Math.max(0, cross - h0) : cross;
  }
  throw new Error("Unknown scalar cost: " + key);
}

function rlPrepareClasses(classes, a, n, keys) {
  if (keys.includes("tv")) {
    // Product TV sums over grouped count vectors, not over A^n product words.
    let work = 0;
    for (const item of classes) {
      const groupCount = new Set(item.counts).size;
      let combinations = 1;
      for (let j = 1; j < groupCount; j++) combinations *= (n + j) / j;
      work += combinations;
    }
    if (work > 5000000) throw new Error("Product total variation exceeds 5,000,000 grouped terms. Reduce N or A, or deselect this function.");
  }
  const nmlConstant = keys.includes("nml")
    ? Math.log2(classes.reduce((sum, item) => sum + Number(item.weight) * 2 ** (-item.h0), 0)) : 0;
  for (const item of classes) {
    const counts = [...item.counts, ...Array(a - item.counts.length).fill(0)];
    for (const key of keys) {
      if (key === "nml") item[key] = item.h0 + nmlConstant;
      else if (!["h0", "kt"].includes(key)) item[key] = rlScalarCost(counts, n, a, key, item.h0);
    }
  }
  return classes;
}

const RL_ARTICLE = [
  { a: 4, n: 8, k: 1, refs: { h0: 6.21, kt: 1.88 } },
  { a: 6, n: 12, k: 1, refs: { h0: 5.98, kt: 2.94 } },
  { a: 8, n: 16, k: 1, refs: { h0: 5.72, kt: 3.17 } },
  { a: 8, n: 16, k: 2, refs: { h0: 7.52, kt: 3.70 } },
  { a: 10, n: 20, k: 1, refs: { h0: 5.38, kt: 3.21 } },
  { a: 12, n: 24, k: 1, refs: { h0: 5.07, kt: 3.17 } },
  { a: 4, n: 6, k: 1, refs: { h1: 20.84, kl: 67.35, gap: 22.92 } },
  { a: 6, n: 5, k: 1, refs: { h1: 73.54, kl: 57.75, gapEntropy: 12.52 } },
  { a: 8, n: 5, k: 1, refs: { gap: 26.01 } },
];

function rlEntropyCost(counts, length) {
  let result = 0;
  for (const count of counts) {
    if (count) result += count * Math.log2(length / count);
  }
  return result;
}

// KT's half-integer gamma ratios can be summed directly, avoiding gamma cancellation.
function rlKtCost(counts, length, alphabet) {
  let result = 0;
  for (let i = 0; i < length; i++) result += Math.log2(i + alphabet / 2);
  for (const count of counts) {
    for (let j = 0; j < count; j++) result -= Math.log2(j + 0.5);
  }
  return result;
}

function rlFactorials(n) {
  const result = [1n];
  for (let i = 1; i <= n; i++) result.push(result[i - 1] * BigInt(i));
  return result;
}

function rlFrequencyClasses(a, n) {
  const factorial = rlFactorials(Math.max(a, n));
  const classes = [];
  const parts = [];
  function visit(remaining, maximum) {
    if (remaining === 0) {
      const repeats = new Map();
      let denominator = 1n;
      for (const count of parts) {
        denominator *= factorial[count];
        repeats.set(count, (repeats.get(count) || 0) + 1);
      }
      let labelDenominator = factorial[a - parts.length];
      for (const count of repeats.values()) labelDenominator *= factorial[count];
      const labels = factorial[a] / labelDenominator;
      const weight = (factorial[n] / denominator) * labels;
      classes.push({
        counts: parts.slice(),
        weight,
        h0: rlEntropyCost(parts, n),
        kt: rlKtCost(parts, n, a),
      });
      return;
    }
    if (parts.length >= a) return;
    for (let next = Math.min(maximum, remaining); next >= 1; next--) {
      if (remaining - next > (a - parts.length - 1) * next) continue;
      parts.push(next);
      visit(remaining - next, next);
      parts.pop();
    }
  }
  visit(n, n);
  return classes;
}

function rlWeightedSummary(classes, key, count, selectLowest) {
  const ordered = selectLowest ? classes.slice().sort((x, y) => x[key] - y[key]) : classes;
  let remaining = count;
  let mean = 0;
  let worst = 0;
  for (const item of ordered) {
    const take = item.weight < remaining ? item.weight : remaining;
    mean += item[key] * (Number(take) / Number(count));
    worst = Math.max(worst, item[key]);
    remaining -= take;
    if (remaining === 0n) break;
  }
  if (remaining !== 0n) throw new Error("Incomplete frequency-class count.");
  return { mean, worst };
}

function rlSequenceCosts(sequence, a, keys) {
  const n = sequence.length;
  const result = {};
  const counts = new Uint32Array(a);
  const gaps = new Uint32Array(a);
  const transitions = new Uint32Array(a * a);
  const outgoing = new Uint32Array(a);
  let logGaps = 0;
  for (let i = 0; i < n; i++) {
    counts[sequence[i]]++;
    if (i) {
      const previous = sequence[i - 1];
      const gap = Math.abs(sequence[i] - previous);
      gaps[gap]++;
      logGaps += Math.log2(gap + 1);
      outgoing[previous]++;
      transitions[previous * a + sequence[i]]++;
    }
  }
  for (const key of keys) {
    if (key === "h0") result[key] = rlEntropyCost(counts, n);
    if (key === "kt") result[key] = rlKtCost(counts, n, a);
    if (key === "gap") result[key] = logGaps;
    if (key === "gapEntropy") result[key] = rlEntropyCost(gaps, n - 1);
    if (key === "h2") {
      const contexts = new Map();
      for (let i = 2; i < n; i++) {
        const context = sequence[i - 2] * a + sequence[i - 1];
        if (!contexts.has(context)) contexts.set(context, new Uint32Array(a));
        contexts.get(context)[sequence[i]]++;
      }
      result[key] = Array.from(contexts.values()).reduce((sum, row) =>
        sum + rlEntropyCost(row, row.reduce((total, count) => total + count, 0)), 0);
    }
    if (key === "mutual") {
      const incoming = new Uint32Array(a);
      for (let i = 1; i < n; i++) incoming[sequence[i]]++;
      let cost = 0;
      for (let i = 0; i < a; i++) for (let j = 0; j < a; j++) {
        const count = transitions[i * a + j];
        if (count) cost += count * Math.log2(count * (n - 1) / (outgoing[i] * incoming[j]));
      }
      result[key] = Math.max(0, cost);
    }
    if (["klIncreasing", "crossIncreasing", "crossGeometric"].includes(key)) {
      result[key] = rlScalarCost(counts, n, a, key);
    }
    if (RL_SYMMETRIC.has(key) && !["h0", "kt", "nml"].includes(key)) {
      result[key] = rlScalarCost(counts, n, a, key);
    }
    if (key === "h1") {
      let cost = 0;
      for (let i = 0; i < a; i++) {
        for (let j = 0; j < a; j++) {
          const count = transitions[i * a + j];
          if (count) cost += count * Math.log2(outgoing[i] / count);
        }
      }
      result[key] = cost;
    }
    if (key === "kl") {
      const logNormalizer = Math.log2(2 * (1 - 2 ** (-a)));
      let cost = 0;
      for (let i = 0; i < a; i++) {
        if (counts[i]) cost += counts[i] * (Math.log2(counts[i] / n) + a - 1 - i + logNormalizer);
      }
      result[key] = Math.max(0, cost);
    }
  }
  return result;
}

async function rlEnumerate(a, n, keys, tick) {
  const count = a ** n;
  const nmlConstant = keys.includes("nml")
    ? Math.log2(rlFrequencyClasses(a, n).reduce((sum, item) => sum + Number(item.weight) * 2 ** (-item.h0), 0)) : 0;
  const costs = Object.fromEntries(keys.map(key => [key, new Float64Array(count)]));
  const sequence = new Uint8Array(n);
  for (let index = 0; index < count; index++) {
    const values = rlSequenceCosts(sequence, a, keys);
    if (keys.includes("nml")) values.nml = rlEntropyCost(
      Array.from({ length: a }, (_, symbol) => sequence.reduce((sum, x) => sum + (x === symbol), 0)), n) + nmlConstant;
    for (const key of keys) costs[key][index] = values[key];
    for (let p = n - 1; p >= 0; p--) {
      sequence[p]++;
      if (sequence[p] < a) break;
      sequence[p] = 0;
    }
    if ((index + 1) % 4096 === 0) await tick((index + 1) / count);
  }
  await tick(1);
  return costs;
}

function rlArraySummary(values, count, selectLowest) {
  if (selectLowest) values.sort();
  let sum = 0;
  let correction = 0;
  let worst = 0;
  for (let i = 0; i < count; i++) {
    const adjusted = values[i] - correction;
    const next = sum + adjusted;
    correction = (next - sum) - adjusted;
    sum = next;
    worst = Math.max(worst, values[i]);
  }
  return { mean: sum / count, worst };
}

function rlMakeRow(config, key, source, shaped) {
  const gain = source.mean - shaped.mean;
  return {
    ...config, key, source: source.mean, shaped: shaped.mean, gain,
    percent: source.mean > 1e-12 ? 100 * gain / source.mean : null,
    sourceWorst: source.worst, shapedWorst: shaped.worst,
    reference: config.refs?.[key] ?? null,
  };
}

async function rlCompute(config, keys, tick) {
  const { a, n, k } = config;
  if (!Number.isInteger(a) || a < 2 || a > 32 ||
      !Number.isInteger(n) || n < 2 || !Number.isInteger(k) || k < 0 || n + k > 30) {
    throw new Error("Use 2 <= A <= 32, N >= 2, K >= 0, and N + K <= 30.");
  }
  const rows = [];
  if (keys.some(key => !(key in RL_FUNCTIONS))) throw new Error("Unknown cost function.");
  const symmetric = keys.filter(key => RL_SYMMETRIC.has(key));
  const other = keys.filter(key => !RL_SYMMETRIC.has(key));
  if (other.length && a ** (n + k) > 2000000) {
    throw new Error("Full enumeration exceeds 2,000,000 sequences. Reduce A, N or K, or deselect order-dependent functions and non-uniform reference functions.");
  }
  if (symmetric.length) {
    const sourceClasses = rlPrepareClasses(rlFrequencyClasses(a, n), a, n, symmetric);
    await tick(0.08);
    const expandedClasses = k ? rlPrepareClasses(rlFrequencyClasses(a, n + k), a, n + k, symmetric) : sourceClasses;
    const count = BigInt(a) ** BigInt(n);
    for (const key of symmetric) {
      rows.push(rlMakeRow(config, key,
        rlWeightedSummary(sourceClasses, key, count, false),
        rlWeightedSummary(expandedClasses, key, count, true)));
    }
    await tick(other.length ? 0.15 : 1);
  }
  if (other.length) {
    const offset = symmetric.length ? 0.15 : 0;
    const scale = 1 - offset;
    const source = await rlEnumerate(a, n, other, p => tick(offset + scale * 0.2 * p));
    const expanded = k
      ? await rlEnumerate(a, n + k, other, p => tick(offset + scale * (0.2 + 0.65 * p)))
      : Object.fromEntries(other.map(key => [key, source[key].slice()]));
    for (let i = 0; i < other.length; i++) {
      const key = other[i];
      rows.push(rlMakeRow(config, key,
        rlArraySummary(source[key], a ** n, false),
        rlArraySummary(expanded[key], a ** n, true)));
      await tick(offset + scale * (0.85 + 0.15 * (i + 1) / other.length));
    }
  }
  return rows.sort((left, right) => keys.indexOf(left.key) - keys.indexOf(right.key));
}

if (typeof document !== "undefined") {
  const rlForm = document.querySelector("#limits-form");
  const rlCancel = document.querySelector("#limits-cancel");
  let rlStopped = false;
  rlCancel.addEventListener("click", () => { rlStopped = true; });
  rlForm.addEventListener("submit", async event => {
    event.preventDefault();
    const status = document.querySelector("#limits-status");
    const note = document.querySelector("#limits-note");
    const body = document.querySelector("#limits-body");
    const counter = document.querySelector("#limits-count");
    const progressElement = document.querySelector("#limits-progress");
    const progress = createProgressController(progressElement);
    const selected = Array.from(rlForm.querySelectorAll('input[name="limits-function"]:checked'), input => input.value);
    const [a, n, k] = ["a", "n", "k"].map(id => Number(document.querySelector("#limits-" + id).value));
    const ref = RL_ARTICLE.find(item => item.a === a && item.n === n && item.k === k);
    const tasks = [{ config: { a, n, k, refs: ref?.refs }, keys: selected }];
    rlStopped = false;
    let rowCount = 0;
    try {
      if (!selected.length) throw new Error("Select at least one cost function.");
      // Validate every job before replacing an earlier result.
      for (const { config, keys } of tasks) {
        if (keys.some(key => !RL_SYMMETRIC.has(key)) && config.a ** (config.n + config.k) > 2000000) {
          throw new Error("This selection requires more than 2,000,000 expanded sequences. Reduce A, N or K, or deselect order-dependent and non-uniform reference functions.");
        }
      }
      rlForm.querySelector('button[type="submit"]').disabled = true;
      rlCancel.disabled = false;
      status.textContent = "Computing";
      note.classList.remove("error");
      note.textContent = "Calculating ensemble means and selection thresholds…";
      body.replaceChildren();
      counter.textContent = "0";
      progressElement.hidden = false;
      for (let i = 0; i < tasks.length; i++) {
        const { config, keys } = tasks[i];
        const rows = await rlCompute(config, keys, async fraction => {
          if (rlStopped) throw new Error("Stopped. Completed comparisons remain available.");
          progress.update((i + fraction) / tasks.length, "Configuration " + (i + 1) + "/" + tasks.length);
          await new Promise(resolve => setTimeout(resolve, 0));
        });
        for (const row of rows) {
          const tr = document.createElement("tr");
          const number = value => value === null ? "—" : value.toFixed(4);
          const cells = [
            RL_FUNCTIONS[row.key], rlUnit(row.key), row.a, row.n + " → " + (row.n + row.k),
            number(row.source), number(row.shaped), number(row.gain),
            number(row.percent), number(row.sourceWorst), number(row.shapedWorst),
          ];
          for (const value of cells) {
            const td = document.createElement("td");
            td.textContent = value;
            tr.append(td);
          }
          body.append(tr);
          counter.textContent = String(++rowCount);
        }
      }
      status.textContent = "Completed";
      note.textContent = "Computed " + rowCount + " comparisons over complete input sets. Each objective uses its own selected subset.";
      progress.update(1, "Completed");
    } catch (error) {
      status.textContent = rlStopped ? "Stopped" : "Check parameters";
      note.classList.add("error");
      note.textContent = error.message;
    } finally {
      rlForm.querySelector('button[type="submit"]').disabled = false;
      rlCancel.disabled = true;
      progressElement.hidden = true;
    }
  });
}
