import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { resolveUploadUrl } from "../../lib/storage";
import { CreateMaterialInput, ListMateriaisQuery } from "../../validators/material.validators";

const materialInclude = {
  turma: { select: { id: true, nome: true, disciplina: true } },
  autor: { select: { id: true, nome: true } },
};

export async function createMaterial(
  professorId: string,
  input: CreateMaterialInput,
  arquivo: Express.Multer.File | undefined
) {
  const turma = await prisma.turma.findUnique({ where: { id: input.turmaId } });

  if (!turma || turma.professorId !== professorId) {
    throw AppError.forbidden("Você só pode publicar materiais para turmas que leciona");
  }

  if (input.tipo === "ARQUIVO") {
    if (!arquivo) {
      throw new AppError("Envie um arquivo para este tipo de material", 400, "ARQUIVO_OBRIGATORIO");
    }
  } else if (!input.conteudo) {
    throw new AppError(
      "Informe o conteúdo (texto ou link) deste material",
      400,
      "CONTEUDO_OBRIGATORIO"
    );
  }

  return prisma.material.create({
    data: {
      titulo: input.titulo,
      descricao: input.descricao,
      tipo: input.tipo,
      conteudo: input.tipo === "ARQUIVO" ? null : input.conteudo,
      arquivoUrl: arquivo ? resolveUploadUrl(arquivo.filename) : null,
      disciplina: input.disciplina,
      tema: input.tema,
      topico: input.topico,
      turmaId: input.turmaId,
      autorId: professorId,
    },
    include: materialInclude,
  });
}

export async function listMateriais(userId: string, role: Role, query: ListMateriaisQuery) {
  const turmaIds =
    role === "PROFESSOR"
      ? (await prisma.turma.findMany({ where: { professorId: userId }, select: { id: true } })).map(
          (t) => t.id
        )
      : (
          await prisma.matricula.findMany({ where: { alunoId: userId }, select: { turmaId: true } })
        ).map((m) => m.turmaId);

  const busca = query.busca;

  return prisma.material.findMany({
    where: {
      turmaId: { in: turmaIds },
      ...(busca
        ? {
            OR: [
              { titulo: { contains: busca, mode: "insensitive" } },
              { tema: { contains: busca, mode: "insensitive" } },
              { disciplina: { contains: busca, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: materialInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteMaterial(professorId: string, materialId: string) {
  const material = await prisma.material.findUnique({ where: { id: materialId } });

  if (!material) {
    throw AppError.notFound("Material não encontrado");
  }

  if (material.autorId !== professorId) {
    throw AppError.forbidden("Você só pode remover materiais que publicou");
  }

  await prisma.material.delete({ where: { id: materialId } });
}
