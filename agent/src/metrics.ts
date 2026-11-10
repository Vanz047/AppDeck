// agent/metrics — coleta de CPU, RAM e FPS do PC.
//
// O I/O nativo fica atrás da interface IMetrics, pra facilitar o teste
// (o teste injeta um mock; o runtime usa a implementação real).

import os from 'node:os'
import { Metrics } from 'shared'

/** Abstrai a coleta — o runtime usa a implementação real; testes, mock. */
export interface IMetrics {
  collect(): Promise<Metrics>
}

/**
 * Usa `os.cpus()` e `os.freemem()` pra medir CPU e RAM.
 *
 * CPU: calcula a variação entre duas leituras de `os.cpus()` num intervalo
 * (precisa de ~1s entre as duas pra ter % confiável).
 */
export class SystemMetrics implements IMetrics {
  private lastCpus: os.CpuInfo[] = []

  async collect(): Promise<Metrics> {
    const cpusNow = os.cpus()
    const cpu = this.cpuPercent(cpusNow)
    this.lastCpus = cpusNow

    const total = os.totalmem()
    const used = total - os.freemem()
    const ram = total > 0 ? (used / total) * 100 : 0

    return {
      cpu: round1(cpu),
      ram: round1(ram),
      ramUsedGB: round1(used / 1e9),
      fps: await FpsProbe.getInstance().probe(),
      timestamp: new Date().toISOString(),
    }
  }

  /** % de CPU baseado na diferença entre as duas leituras de `os.cpus()`. */
  private cpuPercent(cpusNow: os.CpuInfo[]): number {
    if (this.lastCpus.length === 0 || this.lastCpus.length !== cpusNow.length) {
      return 0
    }
    let idleDiff = 0
    let totalDiff = 0
    for (let i = 0; i < cpusNow.length; i++) {
      const prev = this.lastCpus[i]
      const now = cpusNow[i]
      const total =
        now.times.user +
        now.times.nice +
        now.times.sys +
        now.times.idle +
        now.times.irq -
        (prev.times.user + prev.times.nice + prev.times.sys + prev.times.idle + prev.times.irq)
      idleDiff += now.times.idle - prev.times.idle
      totalDiff += total
    }
    if (totalDiff <= 0) return 0
    return (1 - idleDiff / totalDiff) * 100
  }
}

/**
 * Lida o FPS do processo focado. Sem API nativa de FPS no Node, então:
 * - tenta `child_process` + `tasklist` (Windows) e extrai o processo em
 *   primeiro plano; se não encontrar, retorna -1.
 *
 * O teste mocka `IMetrics` inteiro, então a heurística só é exercitada
 * no e2e (fase 5).
 */
export class FpsProbe {
  private static instance: FpsProbe

  private constructor() {}

  static getInstance(): FpsProbe {
    return (FpsProbe.instance ??= new FpsProbe())
  }

  async probe(): Promise<number> {
    // Fase 1: retorna -1. A heurística real de FPS do processo focado fica
    // pra depois que o e2e (fase 5) provar que o resto funciona.
    return -1
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export const defaultMetrics: IMetrics = new SystemMetrics()
