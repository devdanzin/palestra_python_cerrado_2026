# [Quebrando o seu código e o Python](https://pythoncerrado.org/2026/grade/20261107/quebrando-o-seu-codigo-e-o-python-JZP83A)

## Resumo

Vamos explicar como se encontram bugs em código Python, em extensões e nas implementações da linguagem. Além disso, veremos exemplos de bugs encontrados no CPython e outras implementações, em pacotes populares, e até no código dos participantes.

## Linha do tempo (apenas para me situar, será adaptada e depois removida)

- 2 minutos apresentando o palestrante;
- 2 minutos explicando o objetivo da palestra;
- 4 minutos apresentando técnicas e ferramentas para procurar por bugs;
- 4 minutos sobre o processo de encontrar, discutir e corrigir bugs;
- 4 minutos apresentando o CPython e o que é um crash;
- 3 minutos apresentando bugs em implementações alternativas do Python (PyPy, RustPython, etc.);
- 6 minutos apresentando bugs corrigidos e problemas ativos no CPython;
- 4 minutos apresentando bugs corrigidos e problemas ativos em extensões;
- 6 minutos apresentando bugs no software de participantes e como foram encontrados;
- 5 minutos para perguntas e discussão.

| Seção                                 |    Duração | Conteúdo principal                              |
| ------------------------------------- | ---------: | ----------------------------------------------- |
| 1. Introdução                         |      2 min | Quem sou e o que vamos quebrar                  |
| 2. O que é um bug?                    |      3 min | Tipos de falha e primeiro crash surpreendente   |
| 3. Como encontramos bugs?             |      5 min | Revisão manual, análise estática, fuzzing e IA  |
| 4. Quebrando implementações do Python |      8 min | CPython, JIT, PyPy ou RustPython                |
| 5. Quebrando extensões                |      5 min | Bugs em C, C++ e Rust                           |
| 6. Quebrando código Python puro       |      7 min | Stdlib, pacotes conhecidos e projetos sugeridos |
| 7. Do achado à contribuição           |      3 min | Reprodução, validação e responsabilidade        |
| 8. Conclusão e convite                |      2 min | Lições e participação da comunidade             |
| **Apresentação**                      | **35 min** |                                                 |
| Perguntas                             |      5 min |                                                 |
| **Total**                             | **40 min** |                                                 |


### Quem sou

Essas são minhas qualificações, em ordem de importância:

- Sou pai do **Pedro**, que tem 12 anos e está aqui conosco
- Sou **biólogo** e trabalho na área
- Sou Programador **Amador** de Python há mais de 20 anos, nunca trabalhei na área de tecnologia
- Faço parte de dois times **oficiais** do Python: **Triage Team**, que faz triagem de bugs no GitHub do CPython
- E **Fuzzing Team**, grupo voltado ao fuzzing do CPython, a gente vai ver o que é fuzzing daqui a pouco
- Sou um **caçador de bugs**, interessado em ajudar projetos a serem mais robustos encontrando falhas neles

## Introdução

Há quase 20 anos eu procuro problemas em projetos Python. Hoje quero explicar como se faz isso, e principalmente mostrar quais bugs podem ser encontrados.

Todo software não trivial tem bugs. Encontrar e resolver esses bugs é parte importante do desenvolvimento de qualquer sistema. Na Python Brasil em Floripa, agora em outubro, dei uma palestra focando nas técnicas e ferramentas disponíveis para procurar bugs.

Hoje também vamos abordar rapidamente algumas técnicas e ferramentas usadas para caçar bugs para ter um embasamento, mas o principal objetivo dessa palestra é mostrar o que é possível achar. Quando digo que encontrei um bug, do que eu estou falando? Como é isso na prática?

## Tipos de bug

Quando a gente fala de bug, quase todo mundo tem uma imagem mental do que seria isso. Por exemplo quando um software interativo para de responder corretamente: "tô clicando, mas tá bugado, não faz nada!". Ou a exibição fica com problemas gráficos: "bugou!".

Com experiência, vamos formando uma imagem mais detalhada: alguns bugs causam comportamentos inesperados perceptíveis, outros geram resultados errados silenciosamente, outros interrompem a execução do software (são os crashes), outros só ocorrem quando você não está olhando, etc. Alguns se manifestam mesmo que a pessoa usuária faça tudo corretamente, outros surgem de erros de uso. Alguns têm impactos na segurança, outros são apenas cosméticos. Todos os tipos são importantes, e bugs podem ser mais ou menos sérios dentro de cada tipo. Mas o meu tipo preferido de achar são os crashes, quando o software diz "deu ruim, desisto!".

Para cada tipo de bug desses, há técnicas e ferramentas mais adequadas para encontrá-lo.

## Técnicas e ferramentas

Vamos ver quatro abordagens.

### O olho humano: revisão manual

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

### Ferramentas que procuram padrões: análise estática

É chamada análise estática porque examina o código sem executá-lo. Utiliza ferramentas que procuram padrões de código que indicam possíveis bugs, tentando identificar trechos do código que correspondem a regras pré-definidas. Estas regras em geral são configuráveis e muitas vezes podem ser acrescidas de regras personalizadas pela pessoa usuária.

Acredito que seja a técnica com mais ferramentas disponíveis. Exemplos bem conhecidos são linters como ruff e pylint e os checadores de tipagem, como mypy e pyright. Temos outros, por exemplo o bandit, que é um linter para encontrar vulnerabilidades em código Python.

Essas ferramentas mais comuns encontram variáveis não definidas, problemas de estilo, tipos incorretos e fluxos incompletos, mas cada ferramenta trabalha com uma abstração e uma profundidade diferentes.

Vamos dar uma rápida olhada em como uma dessas ferramentas é utilizada, o ruff. Ele é rápido e eficiente, e pode ser configurado para encontrar problemas específicos. Por exemplo, ele não encontra o nosso UAI do código anterior nas configurações padrão.

Mas, se ativamos as regras de fluxo de retorno, o grupo RET, ele encontra o UAI na hora, apontando que falta um `return` explícito no fim de uma função que pode retornar valores.

É uma técnica capaz de lidar com grandes quantidades de código rapidamente, mas tende a gerar falsos positivos.

### Programas que provocam o software com inputs: fuzzing

Fuzzing é uma técnica baseada em gerar e fornecer grandes quantidades de inputs, inclusive inesperados, extremos ou inválidos, e observar como o software reage. Como o software é executado com esses inputs, é uma forma de análise dinâmica.

No fuzzing, em vez de procurar diretamente por padrões de código problemáticos, o fuzzer gera ou modifica inputs, muitas vezes com uma parte aleatória e com um mecanismo de feedback.

Há duas ideias importantes aí: aleatoriedade e feedback.

A aleatoriedade ajuda o fuzzer a experimentar coisas que nós talvez não imaginaríamos.

O feedback mostra quais dessas tentativas parecem interessantes, por exemplo, porque alcançaram uma parte nova do código, e ajuda a escolher as próximas tentativas.

No mundo Python temos várias ferramentas com papéis diferentes, como Atheris, HypoFuzz e o OSS-Fuzz do Google.

E fusil e lafleur são fuzzers mais especializados, focados no Python, que eu desenvolvo e usei em campanhas voltadas para implementações e extensões.

Então vamos sair da teoria. Este foi um programa produzido a partir de uma campanha do fusil.

```python
class Silly:
    def __iter__(self):
        raise RuntimeError("ninguém espera a Inquisição Espanhola")

def generator():
    yield from Silly()

next(generator())  # deveria propagar RuntimeError; ocorria crash
```

Esse código é estranho? É. Mas tem alguma coisa inválida aqui? Não. O `__iter__` é perfeitamente autorizado a levantar uma exceção. O que deveria acontecer? `RuntimeError`. O que aconteceu? **Crash**.

É uma técnica que escala bem, encontra bugs profundos e evita falsos positivos. Mas requer bastante recursos como tempo de CPU. E tende a gerar scripts enormes, já vi programa de 25 mil linhas de Python. Quando minimizado, sobraram nove linhas que reproduziam o bug.

### A mistura das anteriores: análise baseada em IA

A análise baseada em IA é uma abordagem recente, na qual instruímos um LLM a procurar os bugs no código. Podemos fazer isso de forma direta, solicitando a uma IA que procure de forma livre.

Mas vamos falar sobre uma forma mais estruturada: vários agentes, e cada um recebe uma especialidade. Aqui, quando eu falo em agente, pense basicamente numa instância do modelo com uma missão, instruções e ferramentas específicas.

Cada agente tem seus alvos e métodos específicos.

Ou seja, alguns fazem uma leitura direta do código, como fazemos na revisão manual.

Outros procuram padrões de código que costumam indicar problemas. Como na análise estática. Esses agentes podem inclusive rodar ferramentas de análise estática e fazer o trabalho de identificar problemas reais, descartando falsos positivos.

Outros experimentam inputs problemáticos ou inesperados e observam o comportamento do programa. Como no fuzzing.

E a IA também torna práticas, em grande escala, análises que seriam muito trabalhosas manualmente.

Por exemplo, examinar o histórico de correções de um projeto e procurar lugares semelhantes em que o mesmo bug talvez tenha ficado para trás.

É quando você corrige um bug numa função e não percebe que o mesmo bug está presente em outra função parecida.

```slide
Mesmo bug não foi corrigido em código semelhante.
```

Hoje existem muitas ferramentas de IA que suportam Python. Algumas revisam mudanças em PRs. Outras colocam IA sobre resultados de análise estática. E outras trabalham em nível de repositório inteiro.

A família que desenvolvi está principalmente nesse terceiro grupo, com uma especialização adicional: Python, o próprio CPython, extensões.

E essa família já começou a crescer com a colaboração de outras pessoas. Bhuvansh Kataria desenvolveu uma ferramenta para analisar o PyPy, e Charlie Lin, outra voltada a extensões Python em Rust.

```slide
- code-review-toolkit: código Python puro.
- cext-review-toolkit: extensões em C e C++.
- ft-review-toolkit: Free Threading.
- cpython-review-toolkit: código do próprio CPython.
- pypy-review-toolkit: PyPy, criado por Bhuvansh Kataria.
- rust-ext-review-toolkit: extensões em Rust, criado por Charlie Lin.
```

Vamos ver um exemplo do tipo de erro que uma dessas ferramentas encontra:

O alvo da análise era o código por trás do `groupby`, uma ferramenta do módulo `itertools` do Python. Uma correção anterior protegeu referências em `groupby_next` antes de chamar código Python reentrante, por exemplo um dunder eq que avança o iterador.

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

Não precisa entender esse código inteiro. Olhem só para isto: durante o `__eq__`, ele avança o próprio iterador. Usando essa classe como no código à direita, temos um crash.

Você corrige um bug numa função e esquece outra função parecida. Lembram quando eu falei nisso? Acontece de verdade.


## Do achado à contribuição: reportando responsavelmente

Essas ferramentas de fuzzing e IA que discutimos não são teóricas, com aplicação potencial: foram utilizadas em algumas campanhas voltadas ao ecossistema Python e trouxeram resultados significativos.

Mas encontrar um código suspeito é só o começo. Para isso virar uma contribuição, há todo um outro caminho.

Além de encontrar um possível bug, o que chamamos de achado, temos que produzir um script que reproduza esse bug, o que chamamos de reproducer.

Quando temos o reproducer, precisamos checar se aquele já é um problema conhecido: repetir um report anterior desperdiça tempo e energia da pessoa mantenedora.

Com a confirmação de que é um bug desconhecido, precisamos entrar em contato com as pessoas mantenedoras e validar o bug, até mesmo para saber se elas têm interesse em corrigi-lo. 

```slide
Respeito às pessoas mantenedoras!

encontrar → reproduzir → deduplicar → comunicar e validar → corrigir
```

Esse contato com pessoas mantenedoras é algo importante e delicado. Temos que pensar no custo-benefício do nosso trabalho. Um relatório com 50 achados pode significar 50 horas de trabalho para alguém que não pediu por ele e até mesmo que não considera esses bugs relevantes. E se boa parte desses achados forem falsos positivos, a situação fica ainda pior.

A última coisa que você quer é descarregar uma avalanche de achados sobre uma pessoa mantenedora que provavelmente já está sobrecarregada com tarefas relativas ao seu projeto.

Daria para fazer uma palestra inteira só sobre essa parte humana do processo.

## Crashando o Python

O Python é uma linguagem de programação que tem várias implementações, ou seja, vários softwares capazes de entender e rodar a linguagem Python, como o CPython, o PyPy e o RustPython.

Quando falamos do Python ou do interpretador Python, quase sempre estamos falando do CPython, principal implementação. O CPython é um software com o cerne escrito na linguagem C, além de muito Python na biblioteca. E esse software, essa implementação, tem vários bugs conhecidos ou não. Ao contrário dos erros que ocorrem em código Python, que resultam em exceções, problemas no código C do CPython pode causar falhas de segmentação ou aborts, dois jeitos diferentes de um programa crashar.

Vamos ver rapidamente um exemplo de código capaz de fazer o CPython crashar: `super.__new__(super).__get__(super)`. Se você tem um espírito aventureiro, digite esse código num interpretador de Python e me diga o que acontece.

Pois é, é uma situação indesejada, rara, mas que acontece muito. Esse código em especial não é muito preocupante porque é extremamente artificial, a gente não vai esbarrar nesse crash num programa normal. Mas muitos outros exemplos podem acontecer e acontecem em código bem comportado, artesanal, em produção. Inclusive em código com impacto em segurança ou estabilidade do sistema.

Para evitar que esses problemas ocorram em produção, no pior momento, tentamos procurar os bugs preventivamente. Nas minhas campanhas, uso principalmente fuzzing e IA. O fusil é capaz de encontrar crashes em várias implementações de Python, enquanto o lafleur apenas no JIT do CPython. E temos toolkits que focam em implementações específicas: CPython, PyPy e RustPython.

#### Outros exemplos de crashes no CPython, no PyPy e no RustPython

## Crashando extensões

Além do cerne do CPython, muitas extensões para o Python são baseadas em C e C++, como o NumPy e a Pillow. E a cada dia, ficam mais populares as extensões em Rust, como a Polars. São pacotes que contém código nativo, seja para melhor performance, fazer interface com bibliotecas em outras linguagens etc.

Utilizando técnicas muito parecidas com as que são usadas para encontrar bugs nas implementações, podemos encontrar falhas de segmentação, pânicos, etc. nessas extensões. O fuzzing funciona bem e o fusil permite adicionar plugins para ser mais maldoso ainda com as extensões. Os toolkits focam na linguagem da extensão (C, Rust) ou em aspectos específicos do seu funcionamento (Free Threading).

Tem uma história do numpy que eu atrapalhei a vida de uma pessoa. Depois de um bom tempo discutindo com as pessoas mantenedoras do numpy, essa pessoa conseguiu convencê-las que um bug que ela tinha encontrado merecia uma recompensa por ser um bug de segurança. No último segundo, quando já iam pagar, as pessoas mantenedoras do numpy descobriram que eu já tinha relatado esse bug antes, então era uma duplicata e a pessoa não fazia jus à recompensa.

#### Exemplos de crashes em extensões

## Encontrando bugs em Python puro

As minhas ferramentas de fuzzing não são boas para encontrar problemas em Python puro, pois focam em crashes, apesar de isso não ser uma limitação dos fuzzers em geral. Como mencionei antes, há muitas ferramentas de análise estática que funcionam bem para isso. Mas o que tem capturado a minha atenção são as ferramentas de IA.

Com o code-review-toolkit, encontramos diversos tipos de bugs, desde problemas sutis de lógica até erros de fluxo de execução desastrosos, passando por esgotamento de recursos e falhas de segurança.

#### Problemas encontrados na sdtlib
#### Problemas encontrados em pacotes conhecidos
#### Problemas encontrados no pavedb, scanapi e brutils, pacotes sugeridos pelos mantenedores

## Convite

Se você mantém um projeto Python, usa um projeto no qual gostaria de contribuir ou simplesmente tem curiosidade sobre se as ferramentas conseguem achar bugs em um projeto específico, por favor sugira-o como ~~uma vítima~~ um alvo para análise. Podemos trabalhar juntos nisso depois da palestra.

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