---
name: golive-storage
description: Guardar e servir ficheiros por projecto com o armazenamento do GoLive — carregar, listar, descarregar e apagar pela CLI ou pelo explorador do dashboard, com links temporários e facturação por GB.
---

# GoLive — Armazenamento de ficheiros

Guarda ficheiros (imagens, uploads dos utilizadores, PDFs…) por projecto,
organizados em pastas. Cobrado como armazenamento: **1.250 Kz/GB·mês**.

## CLI

```bash
golive storage upload logo.png imagens/logo.png   # destino = caminho no storage
golive storage ls imagens/
golive storage download imagens/logo.png ./logo.png
golive storage rm imagens/logo.png                # pasta: termina em "/"
```

## Dashboard

O separador **Armazenamento** tem um explorador: navegação por pastas, upload
arrasta-e-larga, descarregar, copiar link e apagar, com uma barra de uso.

## Notas

- Os **links de descarga são temporários** (válidos 1 hora) — bons para partilha
  segura e downloads, não para servir assets públicos permanentes.
- O uso conta para o limite de armazenamento do plano (Free: 1 GB; Pague por uso:
  500 GB), e é facturado ao GB·mês.

**Ideal para:** guardar assets do projecto ou ficheiros carregados pelos
utilizadores.
