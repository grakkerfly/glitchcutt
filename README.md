# glitchcut — GitHub Pages

## Primeiro envio

Copie o CONTEÚDO desta pasta para a raiz do repositório grakkerfly/glitchcutt. Inclua a pasta oculta .github (ela contém workflows/pages.yml). Não é preciso enviar node_modules.

No GitHub, abra Settings > Pages > Build and deployment > Source e selecione GitHub Actions. Envie os arquivos pelo GitHub Desktop (Commit e Push origin). A execução Publish glitchcut aparece em Actions e publica o site.

Endereço padrão esperado: https://grakkerfly.github.io/glitchcutt/

O workflow está configurado para main ou master. Se usar outra branch, altere branches em .github/workflows/pages.yml.

## Atualizar projetos

Crie/atualize as subpastas de projects e faça Commit / Push. A automação gera projects.json e publica novamente. Não precisa editar HTML ou JavaScript. project.json é opcional para título e descrição.

## Prévia local

Execute npm start ou node build-catalog.mjs seguido de node server.mjs. Atualize o catálogo após adicionar mídias. server.mjs é apenas para a prévia, não é incluído na publicação.

## Domínio

Não foi configurado CNAME: primeiro valide o endereço padrão. Depois, configure thefutureisglitched.lol em Settings > Pages e o DNS do domínio.

## Limite de tamanho

As mídias já estão próximas do limite de 1 GB do site publicado no Pages. O catálogo avisa acima de 950 MiB. Os originais não foram alterados, nem foram geradas prévias comprimidas nesta adaptação.
