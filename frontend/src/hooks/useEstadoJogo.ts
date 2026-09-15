import { useCallback, useEffect, useRef, useState } from "react";
import * as quizService from "../services/quiz.service";
import type { EstadoJogo } from "../types";

const INTERVALO_PADRAO_MS = 1000;

/**
 * Mantém o estado do jogo sincronizado por polling.
 *
 * Optamos por polling em vez de WebSocket: para uma turma o efeito é o mesmo e
 * o jogo continua usando a mesma autenticação JWT do resto da API, sem
 * infraestrutura extra. O polling para sozinho quando a sessão encerra.
 */
export function useEstadoJogo(sessaoId: string | undefined, intervaloMs = INTERVALO_PADRAO_MS) {
  const [estado, setEstado] = useState<EstadoJogo | null>(null);
  const [recebidoEm, setRecebidoEm] = useState(() => Date.now());
  const [erro, setErro] = useState<string | null>(null);

  /** Há uma busca do intervalo em andamento? (não bloqueia recargas forçadas) */
  const emVooRef = useRef(false);
  /** Numeração das requisições, para descartar respostas fora de ordem. */
  const sequenciaRef = useRef(0);
  const ultimaAplicadaRef = useRef(0);

  const buscar = useCallback(
    async (forcado = false) => {
      if (!sessaoId) return;
      // O polling periódico espera a busca anterior terminar, mas uma recarga
      // forçada (logo após responder ou avançar) nunca é ignorada — senão a
      // tela ficaria até um segundo mostrando a pergunta antiga.
      if (!forcado && emVooRef.current) return;

      const sequencia = ++sequenciaRef.current;
      emVooRef.current = true;

      try {
        const novo = await quizService.getEstado(sessaoId);
        // Uma resposta antiga que chegou atrasada não pode sobrescrever um
        // estado mais novo já aplicado.
        if (sequencia < ultimaAplicadaRef.current) return;
        ultimaAplicadaRef.current = sequencia;

        setEstado(novo);
        setRecebidoEm(Date.now());
        setErro(null);
      } catch {
        setErro("Não foi possível sincronizar o jogo.");
      } finally {
        emVooRef.current = false;
      }
    },
    [sessaoId]
  );

  const recarregar = useCallback(() => buscar(true), [buscar]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  const encerrada = estado?.sessao.status === "ENCERRADA";

  useEffect(() => {
    if (!sessaoId || encerrada) return;
    const id = setInterval(() => buscar(), intervaloMs);
    return () => clearInterval(id);
  }, [sessaoId, encerrada, intervaloMs, buscar]);

  return { estado, setEstado, recebidoEm, erro, recarregar };
}

/**
 * Conta o tempo restante localmente entre um poll e outro, para o cronômetro
 * correr suave em vez de pular de segundo em segundo.
 *
 * O valor é derivado do prazo (instante em que a pergunta fecha) a cada render,
 * e não guardado em estado próprio. Isso é importante: guardando em estado, no
 * render em que uma pergunta nova chega o tempo ainda seria o da pergunta
 * anterior — e uma pergunta nova poderia nascer "com o tempo esgotado",
 * disparando a resposta automática por timeout indevidamente.
 */
export function useContagemRegressiva(restanteMsDoServidor: number | null, recebidoEm: number) {
  const [, forcarRender] = useState(0);
  const rodando = restanteMsDoServidor !== null;

  useEffect(() => {
    if (!rodando) return;
    const id = setInterval(() => forcarRender((n) => n + 1), 100);
    return () => clearInterval(id);
  }, [rodando]);

  if (restanteMsDoServidor === null) return 0;

  const prazo = recebidoEm + restanteMsDoServidor;
  return Math.max(0, prazo - Date.now());
}
