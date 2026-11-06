# [Quebrando o seu código e o Python - Roteiro](https://pythoncerrado.org/2026/grade/20261107/quebrando-o-seu-codigo-e-o-python-JZP83A)

## Resumo

Vamos explicar como se encontram bugs em código Python, em extensões e nas implementações da linguagem. Além disso, veremos exemplos de bugs encontrados no CPython e outras implementações, em pacotes populares, e até no código dos participantes.

## Introdução

Boa tarde! Esta é a palestra "Quebrando o seu código e o Python".

Meu nome é Daniel, sou pai, biólogo, programador amador e caçador de bugs.

Há quase 20 anos procuro problemas em projetos Python.

Todo software não trivial tem bugs. Encontrar e resolver esses bugs é parte importante do desenvolvimento de qualquer sistema. Na Python Brasil em Floripa, agora em outubro, dei uma palestra focando nas técnicas e ferramentas disponíveis para procurar bugs.

Hoje quero mostrar outra coisa: o que acontece quando encontramos esses bugs.

Inclusive aqueles que conseguem derrubar o próprio Python.

Não estou falando de código que levanta uma exceção Python, pois ela pode ser capturada e o programa seguir em frente. Estou falando de um crash do interpretador: o Python simplesmente para de funcionar e o processo é encerrado.

Por exemplo, olhem este código:
```python
super.__new__(super).__get__(1)
```
Se você executá-lo num Python 3.13 ou mais recente, isso vai imediatamente causar um erro de segmentação. O que isso significa? A execução é interrompida anormalmente, ou seja o interpretador para de funcionar, ou seja sofre um crash, ou seja bate as botas.

Quem tiver um espírito aventureiro pode abrir um prompt de comando do Python e digitar esse código, daí me conte o que acontece. Só não faça isso numa sessão já existente, importante pra você.

Esse código em especial não é muito preocupante porque é extremamente artificial, a gente não vai esbarrar nesse crash num programa normal. Mas muitos outros exemplos podem acontecer e acontecem em código bem comportado, artesanal, em produção. Inclusive em código com impacto na segurança ou na estabilidade do sistema.

## Tipos de bug

Quando a gente fala de bug, quase todo mundo tem alguma imagem mental do que seria isso. Por exemplo quando um software interativo para de responder corretamente: "tô clicando, mas tá bugado, não faz nada!". Ou a exibição fica com problemas gráficos: "í bugou!". Ou o software é encerrado inesperadamente: "fechou sozinho!". E por aí vai.

Podemos descrever de forma bem grosseira os principais tipos de bug assim:

**Resultado errado | Fluxo inesperado | Estado inconsistente | Crash | Vulnerabilidade**

Todos os tipos são importantes e se sobrepõem, e bugs podem ser mais ou menos sérios dentro de cada tipo. Mas o meu tipo preferido de achar são os crashes, quando o software diz "deu ruim, desisto!".

Para cada tipo de bug desses, há técnicas e ferramentas mais adequadas para encontrá-lo.

## Como encontramos bugs

Vamos ver quatro abordagens.

### Revisão manual

Nesse caso, procuramos os bugs ativamente, observando o código com atenção e mapeando os fluxos na nossa mente, mas sem técnicas ou ferramentas específicas para ajudar. Para funcionar, isso requer experiência e faro. É como a gente procura bugs quando está escrevendo o software e algo não funciona.

Eu gosto de chamar de Desenvolvimento Guiado por Uai, porque o que acontece é que você olha pro código e pensa "UAI! o código tá errado aqui!" ou "Ué, isso vai dar crash...".

Vamos usar nossos olhos como ferramenta e observar o código abaixo para ver se encontramos um "Uai". É um código mal escrito e confuso, mas isso é só para atrapalhar a análise de vocês.

```python
def max_power(a, b):
    """Maior número na exponenciação de um par."""
    if a > b:
        result = b ** a
        if b < 0 and a % 2 == 0:
            result = abs(result)
        return result
    else:
        result = a ** b
        if a < 0 and b % 2 == 0:
            result = abs(result)
```

Acharam um Uai? Pode levantar a mão ou arriscar uma resposta.

O Uai que eu vejo é que falta um `return` ao final do bloco do `else`: o código calcula tudo direitinho, guarda em `result` e... esquece de retornar. Quem chamar a função por esse caminho recebe `None`. Talvez você encontre outro Uai na matemática ou na lógica, mas deu para entender o princípio.

É uma técnica boa para ir fundo em um problema específico, mas não para analisar muito código de maneira rápida.

### Análise estática

É chamada análise estática porque examina o código sem executá-lo. Utiliza ferramentas que procuram padrões de código que indicam possíveis bugs, tentando identificar trechos do código que correspondem a regras pré-definidas. Estas regras em geral são configuráveis e muitas vezes podem ser acrescidas de regras personalizadas pela pessoa usuária.

Exemplos bem conhecidos são linters como ruff e pylint e os checadores de tipagem, como mypy e pyright.

<!-- Vamos dar uma rápida olhada em como uma dessas ferramentas é utilizada, o ruff. Ele é rápido e eficiente, e pode ser configurado para encontrar problemas específicos. Por exemplo, ele não encontra o nosso UAI do código anterior nas configurações padrão.

Se ativamos as regras de fluxo de retorno, o grupo RET, ele encontra o UAI na hora, apontando que falta um `return` explícito no fim de uma função que pode retornar valores. Mas percebam que ele não sabe o que deveria ser retornado, apenas que faltou um return. -->

É uma técnica capaz de lidar com grandes quantidades de código rapidamente, mas tende a gerar falsos positivos.

### Fuzzing

Fuzzing é uma técnica baseada em gerar e fornecer grandes quantidades de inputs, inclusive inesperados, extremos ou inválidos, e observar como o software reage. É uma análise dinâmica, pois executa o software com esses inputs.

O fuzzer gera ou modifica inputs, muitas vezes com uma parte aleatória e com um mecanismo de feedback.

A aleatoriedade ajuda o fuzzer a experimentar coisas que nós talvez não imaginaríamos.

O feedback mostra quais dessas tentativas parecem interessantes, por exemplo, porque alcançaram uma parte nova do código, e ajuda a escolher as próximas tentativas.

Como exemplo vou citar fusil e lafleur, que são fuzzers mais especializados, focados no Python, que eu desenvolvo e usei em campanhas voltadas para implementações e extensões.

É uma técnica que escala bem, consegue encontrar bugs profundos e frequentemente produz evidências executáveis, como crashes ou comportamentos inesperados reproduzíveis. 

### Análise baseada em IA

A análise baseada em IA é uma abordagem recente, na qual instruímos um LLM a procurar os bugs no código.

A família de ferramentas de IA que desenvolvi foca em análise sistemática de bases de código, cada ferramenta com uma especialização adicional: análise de Python, do próprio CPython, de outras implementações, de extensões.

E essa família já começou a crescer com a colaboração de outras pessoas. Bhuvansh Kataria desenvolveu uma ferramenta para analisar o PyPy, e Charlie Lin, outra voltada a extensões Python em Rust.

```slide
- code-review-toolkit: código Python puro.
- cext-review-toolkit: extensões em C e C++.
- ft-review-toolkit: Free Threading.
- cpython-review-toolkit: código do próprio CPython.
- pypy-review-toolkit: PyPy, criado por Bhuvansh Kataria.
- rust-ext-review-toolkit: extensões em Rust, criado por Charlie Lin.
```

Uma abordagem que utilizo é dividir a análise entre agentes especializados. Alguns procuram erros de memória, outros problemas de concorrência, outros falhas de lógica. Eles podem usar ferramentas, executar testes e aproveitar resultados uns dos outros.

E a IA também torna práticas, em grande escala, análises que seriam muito trabalhosas manualmente.

Por exemplo, examinar o histórico de correções de um projeto e procurar lugares semelhantes em que o mesmo bug talvez tenha ficado para trás.

É quando você corrige um bug numa função e não percebe que o mesmo bug está presente em outra função parecida.

```slide
Mesmo bug não foi corrigido em código semelhante.
```


## Desvendando um crash

Deixa eu mostrar como a gente descobre o que deu errado quando ocorre um crash. Sabe quando ocorre uma exceção no nosso código Python e aparece a mensagem de erro, mostrando a linha com o problema e a sequência de linhas que levou até o problema? Aquilo é um traceback do código Python.

```
Slide com um traceback da chamada do super.__new__ em versão antiga.
```

Com um crash, podemos usar um debugger como o GDB e fazer a interrupção anormal da execução acontecer sob observação. Isso vai nos dar a linha onde o problema ocorreu e a sequência de linhas que levou até o problema. Isso é um backtrace do código nativo. Não parece simples de entender, né? Mas corresponde bonitinho a um traceback do Python, só que falando do código em C.

```
Slide com o backtrace do crash do super.__new__ em versão recente.
```

Também existem ferramentas específicas para esclarecer outros aspectos de um crash, como o AddressSanitizer que analisa o estado da memória de um programa, ou o faulthandler do CPython, que nos dá um traceback simplificado sem precisar de um debugger.

## Crashando o Python

O Python é uma linguagem de programação que tem várias implementações, ou seja, vários softwares capazes de entender e rodar a linguagem Python, como o CPython, o PyPy e o RustPython.

Quando falamos do Python ou do interpretador Python, quase sempre estamos falando do CPython, principal implementação. O CPython é um software com o cerne escrito na linguagem C, além de muito Python puro na biblioteca. E esse software, essa implementação, tem vários bugs conhecidos ou não. Ao contrário dos erros que ocorrem em código Python, que resultam em exceções, problemas no código C do CPython podem causar falhas de segmentação ou aborts, dois jeitos diferentes de um programa crashar.

Pois é, é uma situação indesejada e rara, mas que acontece muito.

Para evitar que esses problemas ocorram em produção, no pior momento, tentamos procurar os bugs preventivamente. Nas minhas campanhas, uso principalmente fuzzing e IA. O fusil é capaz de encontrar crashes em várias implementações de Python, enquanto o lafleur apenas no JIT do CPython. E temos os toolkits de IA já citados, que focam em implementações específicas: CPython, PyPy e RustPython.

#### Outros exemplos de crashes no CPython

##### `__iter__`

Então vamos sair da teoria. Este foi um programa produzido a partir de uma campanha do fusil em cima do CPython.

```python
class Silly:
    def __iter__(self):
        raise RuntimeError("ninguém espera a Inquisição Espanhola")

def generator():
    yield from Silly()

next(generator())
```

Esse código é estranho? É. Mas tem alguma coisa inválida aqui? Não. O `__iter__` é perfeitamente autorizado a levantar uma exceção. O que deveria acontecer? `RuntimeError`. O que aconteceu? **Crash**.



##### `list.pop`

Temos aqui um exemplo no qual o Python 3.13.2 crashava com código razoavelmente normal e bem comportado.
```python
def call(part):
    part.pop()

call(['a'])
try:
    call(list)
except TypeError:
    raise
```

Esperado: `TypeError: unbound method list.pop() needs an argument`.
Resultado: crash.

Esse exemplo foi considerado bem sério, tanto é que virou release blocker. Isso significa que a próxima versão do Python não poderia ser lançada antes que o bug fosse corrigido.

##### `_grouper_next`

Vamos ver um exemplo do tipo de erro que uma dessas ferramentas de IA encontra:

<!-- O alvo da análise era o código por trás do `groupby`, uma ferramenta do módulo `itertools` do Python. Uma correção anterior protegeu referências em `groupby_next` antes de chamar código Python reentrante, por exemplo um dunder eq que avança o iterador.

O `cpython-review-toolkit` examinou o histórico e encontrou a mesma operação desprotegida na função irmã `_grouper_next`. Um `__eq__` malicioso podia reentrar no iterador, substituir e liberar uma chave ainda em uso, produzindo use-after-free e causando crash.

O código no slide, que é bastante avançado, fazia o CPython ter uma falha de segmentação.

```python
import itertools

class Key:
    __hash__ = None
    counter = 0

    def __eq__(self, other):
        if not self.counter:
            self.counter += 1
            try: next(grouper_iter)
            except StopIteration: pass
            return NotImplemented
        return True

g = itertools.groupby(range(4), lambda x: Key())
key, grouper_iter = next(g)
items = list(grouper_iter)
```

Não precisa entender esse código inteiro. Olhem só para isto: durante o `__eq__`, ele avança o próprio iterador. Usando essa classe como no código à direita, temos um crash. -->

Você corrige um bug numa função e esquece outra função parecida. Lembram quando eu falei nisso? Acontece de verdade.


#### Quebrando implementações do Python (cerca 8 min, 4 bugs?)

##### Lista recursiva no RustPython

```python
L = []
L.append(L)
list[L].__parameters__
```
Esperado: `RecursionError`
Resultado: crash

Este bug é interessante não porque seja sério ou um código normal, mas porque atingia duas implementações de Python: RustPython e CPython. Quando a gente acha um bug numa implementação diferente, o normal é comparar com o CPython pra ver qual é o comportamento esperado. Nesse caso, o CPython tinha o mesmo defeito!

Também é interessante porque foi encontrado com IA e fuzzing de forma independente.


##### `zip_longest` no PyPy
```python
import itertools
z = itertools.zip_longest([], [1, 2, 3])
next(z)   # arg 0 is exhausted here; z itself is still live
list(z)   # SIGSEGV
```

Esperado: `[]`, uma lista vazia.
Resultado: crash

##### `binascii` no RustPython

```python
binascii.b2a_qp(b'\n')
```

Esperado: `b'\n'`
Resultado: pânico do Rust

```rust
  thread 'main' panicked at crates/stdlib/src/binascii.rs:507:49:
  index out of bounds: the len is 8 but the index is 18446744073709551615
```

Como podemos ver o Rust fica um pouco confuso e procurando um índice de 18 quintilhões.


## Crashando extensões

Às vezes você escreve Python, chama uma função aparentemente normal e inocente de uma biblioteca e, de repente, o processo inteiro cai. Como isso acontece?

Além do cerne do CPython, muitas extensões para o Python são baseadas em C e C++, como o NumPy e a Pillow. E a cada dia, ficam mais populares as extensões em Rust, como a Polars. São pacotes que contém código nativo, seja para melhor performance, fazer interface com bibliotecas em outras linguagens etc.

Utilizando técnicas muito parecidas com as que são usadas para encontrar bugs nas implementações, podemos encontrar falhas de segmentação, pânicos, etc. nessas extensões.

Um caminho comum para esses erros é:

**uma chamada falha → o código não trata corretamente a falha → a extensão continua → ocorre um crash**


#### Exemplos de crashes em extensões

##### Quebrando extensões (5 min, 2–3 bugs)

| # | Bug | Alvo | Tipo | Origem | Situação | Risco de demo |
|---|---|---|---|---|---|---|

| repo#n | Título | Tipo | /15 | Fix em |
| numpy#31046 → PR#31297 | `arr.flags["é"] = True` segfalta; re-reportado por um "agentic security harness" sem citar; o PR de um brasileiro feito do gist do palestrante virou **duplicata** | segfault | 15 | ≤ 30 d |
| numpy#28787 | `numpy.float128().round(-2**31)` segfalta; *"almost led to a CVE"* | segfault (UB) | 14 | 188 d |

| 1 | **CX-MULTIDICT-0002** — `MultiDict().add(key="k")` segfalta; a versão em Python puro dá `TypeError` | multidict (C; base do aiohttp) | segfault | IA (parity-checker) | PR #1376 aberto a pedido do mantenedor | baixo (versão ≤ 6.7.2.dev0) |


| CX-MULTIDICT-0001 | `d.extend(d)` use-after-free — crasha em release **sem ASan**; PR mesclado 06/09; ressalva de UAF resolvida | 23 | +3 | SEGURO COM BUILD multidict==6.7.1 |


## Encontrando bugs em Python puro

As minhas ferramentas de fuzzing não são boas para encontrar problemas em Python puro, pois focam em crashes, apesar de isso não ser uma limitação dos fuzzers em geral. Como mencionei antes, há muitas ferramentas de análise estática que funcionam bem para isso. Mas o que tem capturado a minha atenção são as ferramentas de IA.

Com o code-review-toolkit, encontramos diversos tipos de bugs, desde problemas sutis de lógica até erros de fluxo de execução desastrosos, passando por esgotamento de recursos e falhas de segurança.

#### Problemas encontrados na stdlib
| 2 | **CRF-PYREPL-0014** — Ctrl-C no REPL novo grava no histórico a linha que você cancelou | CPython 3.13+ `_pyrepl` | resultado errado (privacidade) | IA (parity-check vs GNU readline) | reproduced; não reportado | médio: precisa de terminal real (gif/vídeo) |
| 3 | **CRF-IDLELIB-0035** — Format Paragraph do IDLE come uma letra de cada linha de código | idlelib | corrupção silenciosa de fonte | IA | reportado #154760 l.35 | baixo: `reformat_comment` é função pura |
| 4 | **CRF-IDLELIB-0027** — `if sellast[-1] != '0'`: copiar-com-prompts perde a última linha nas colunas 10, 20, 100… | idlelib | resultado errado | IA | reportado #154760 l.27 | o "Uai" está na linha; a prova precisa de Tk |
#### Problemas encontrados em pacotes conhecidos
| # | Bug | Alvo | Tipo | Origem | Situação | Risco de demo |
|---|---|---|---|---|---|---|
| 1 | **CRF-COVPY-0007** — `--fail-under=99.9` passa num relatório que imprime 99% | coverage.py | resultado errado (gate de CI) | IA (silent-failure-hunter) | reproduced; #1168 "corrigiu" só o caso 100 | baixo: 3 linhas puras |


#### Problemas encontrados no pavedb, scanapi e brutils, pacotes sugeridos pelos mantenedores


Quebrando código Python puro (7 min, 3–4 bugs)




Quatro vítimas diferentes (CI, histórico, editor, clipboard), três ferramentas que a plateia usa, e
nenhum crash — é aqui que a tese "crash é o bug bonzinho" fecha. O item 1 tem a frase pronta:
"duas funções no mesmo arquivo, duas direções de arredondamento". O item 2 tem o contraste
"o readline em C acerta há décadas; a reescrita em Python trocou o significado de `finish`".

Considerar substituir alguns casos por exemplos dos projetos analisados a pedido das pessoas mantenedoras.

Lembram que eu falei que gosto de crashes? Pois é. Nesse caso, o programa não caiu. Ele continuou funcionando e informou um resultado errado.
E isso pode ser muito mais difícil de perceber.

## Lições importantes

Dois fios atravessam os exemplos de bug que vimos.

1. **Crash é o bug bonzinho: ele avisa.** Não significa que um crash não possa ser um problema sério, inclusive de segurança, mas o fato de o programa parar de rodar dá um sinal claro de que existe um problema. Com o resultado errado silencioso, o problema pode permanecer oculto, causando prejuízos.

2. **O bug ao lado do bug corrigido.** Uma grande proporção dos bugs que encontro são casos onde o fix esqueceu de corrigir a *função irmã*, justificando a análise cuidadosa de histórico de correções no git.

## Do achado à contribuição: reportando responsavelmente

Vocês viram alguns bugs encontrados com ferramentas diferentes. Mas existe uma parte importante dessa história que ainda não mostramos.

Como um código suspeito se transforma numa correção incorporada ao projeto? Resumidamente, funciona assim.

Além de encontrar um possível bug, o que chamamos de achado, temos que produzir um script que reproduza esse bug, o que chamamos de reproducer.

Quando temos o reproducer, precisamos checar se aquele já é um problema conhecido: repetir um report anterior desperdiça tempo e energia da pessoa mantenedora.

Com a confirmação de que é um bug desconhecido, precisamos entrar em contato com as pessoas mantenedoras e validar o bug, até mesmo para saber se elas têm interesse em corrigi-lo. 

E até agora mostrei vários bugs encontrados pelas ferramentas. Mas nem tudo o que parece um bug realmente é um bug.

Numa das campanhas, encontramos o que parecia ser uma família de corrupções de memória. Depois de investigar, descobrimos que o problema estava na própria ferramenta de teste.

Então temos que pensar no custo-benefício do nosso trabalho para a pessoa mantenedora, é algo delicado. Um relatório com 50 achados pode significar 50 horas de trabalho para alguém que não pediu por ele e até mesmo que não considera esses bugs relevantes. 

A última coisa que você quer é descarregar uma avalanche de achados sobre uma pessoa mantenedora que provavelmente já está sobrecarregada com tarefas relativas ao seu projeto.

```slide
Respeito às pessoas mantenedoras!

encontrar → reproduzir → deduplicar → comunicar e validar → corrigir
```

Daria para fazer uma palestra inteira só sobre essa parte humana do processo.

Considerar usar algo do material abaixo se fizer sentido:

Anedotas com fonte nos catálogos, sem precisar de slide de código:

- **Corrigido seis dias antes de ser achado** (CRASH-0001): a frota rodava um build de 18/07; o PR entrou em 24/07. Lição gravada: "rebuild the matrix before a campaign".
- **35 gists → 31 bugs**: na guarda-chuva #151763, o `rr` provou que quatro "bugs" eram faces do mesmo (OOM-0036, o bug camaleão com 8 caras).
- **Falso bug por culpa do harness**: uma família inteira de "corrupção de heap" era artefato do próprio fusil trocando alocador com threads vivas. "Verificar antes de afirmar."
- **Issue fechada errado** (#148873 → #154130): classificada como corrida "benigna"; o catálogo trouxe o crash e reabriu como outra issue.
- **Mantenedores dizendo não** (#150505, TSAN-0057 `wont-file`) e **mantenedores pedindo PR em vez de issue** (multidict).
- **"É duplicação dos unittests do CPython?"** (RustPython #8325): só 2 de 9 seriam pegos pela suíte.
- **PyPy corrigido em 24h** com a explicação da issue *errada* — o mantenedor consertou no lugar certo mesmo assim (PYPY-FUZZ-015).
- **NumPy e a recompensa** (fonte: reported-bugs-catalog).

## Conclusão e Convite

Hoje vimos que bugs podem estar no código que escrevemos, nas bibliotecas que utilizamos e até no próprio interpretador Python.

Também vimos que encontrá-los pode exigir técnicas muito diferentes. Às vezes basta olhar para o código e pensar ‘Uai!’. Outras vezes precisamos de milhões de execuções ou de agentes de IA especializados. 

Discutimos como corrigir um bug não garante que você eliminou todas as suas variantes, e que o bug nem sempre está onde o sintoma aparece.

Mas o mais importante não é simplesmente encontrar bugs. É conseguir transformar essas descobertas em contribuições que melhorem os projetos analisados.

Se vocês quiserem participar dessa caça, me procurem depois da palestra. Podemos procurar bugs no código de vocês também.

## Contato e agradecimento

Esses são os meus contatos.

Muito obrigado!

----

## Anexo: Posts

### Post Telegram PT
**Convite / Ajuda com palestra Python Cerrado 2026**

Gostaria de convidar **você** a sugerir um projeto no qual procurarei bugs para minha palestra "Quebrando o seu código e o Python" na Python Cerrado 2026.

Se você mantém um projeto Python, em especial uma extensão em C/C++/Rust (mas Python puro também vale), por favor sugira-o como ~~uma vítima~~ um alvo para análise. Resultados interessantes serão apresentados na palestra, se você concordar. Nada será publicado sem permissão, nem haverá spam de bugs não solicitados.

As ferramentas e técnicas a serem apresentadas já encontraram bugs no CPython, no Pillow, no Cython, no PyPy e em dezenas de outros projetos. Veremos alguns dos achados mais importantes ou inusitados, faremos o código (seu, de projetos escolhidos e do próprio Python) crashar, e discutiremos a arte da caça aos bugs.

https://pythoncerrado.org/2026/grade/20261107/quebrando-o-seu-codigo-e-o-python-JZP83A

### Post Mastodon PT
```
Ajuda com palestra Python Cerrado 2026

Gostaria de convidar **você** a sugerir um projeto no qual procurarei bugs para minha palestra na Python Cerrado 2026.

Se você mantém um projeto Python, usa um projeto no qual gostaria de contribuir ou simplesmente tem curiosidade sobre se as ferramentas conseguem achar bugs em um projeto específico, por favor sugira-o como ~~uma vítima~~ um alvo para análise e os resultados serão apresentados na palestra.

https://pythoncerrado.org/2026/grade/20261107/quebrando-o-seu-codigo-e-o-python-JZP83A

#Python #PyCerrado2026 #Bugs
```