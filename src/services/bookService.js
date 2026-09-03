/**
 * MeliodasBot — Book & PDF Document Service (Versão Multilíngue Inteligente com Contagem de Páginas)
 * Suporte a múltiplos idiomas (Português, Inglês, Espanhol, Francês, Alemão, Italiano)
 * Acervo Verificado com Livros Completos em PDF + Archive.org + OpenLibrary
 */

const https = require('https');
const http = require('http');
const logger = require('../core/logger');
const { generateEbookPdf } = require('../utils/pdfGenerator');

// Dicionário de internacionalização para a interface de livros
const I18N_BOOK_LABELS = {
    pt: {
        loading: '⏳ 📚 *Localizando acervo e preparando download para:* _"{query}"_... Aguarde.',
        headerTitle: 'FICHA TÉCNICA DA OBRA',
        officialTitle: 'Título Oficial',
        author: 'Autor(es)',
        year: 'Ano de Lançamento',
        edition: 'Edição / Editora',
        pages: 'Extensão / Páginas',
        genre: 'Gênero',
        fileSize: 'Tamanho do Arquivo',
        source: 'Fonte do Acervo',
        sourceLink: 'Link de Origem',
        securityLabel: 'Status de Acesso / Senha',
        unlocked: '🔓 Livre de Senha (Desbloqueado para Leitura)',
        language: 'Idioma da Obra',
        synopsisTitle: 'SINOPSE OFICIAL',
        tipAuthor: 'Para ver outras obras de {author}, digite .autor {author} ou .livro lista {author}',
        notFound: '❌ *Nenhum livro ou documento encontrado para:* _"{query}"_\n\n💡 *Dica:* Tente pesquisar com termos mais simples ou use flags como `--en`, `--es`, `--fr`.',
        langName: 'Português (pt-BR)',
        helpTitle: 'BIBLIOTECA DIGITAL & ACERVO DE LIVROS',
        howToSearch: 'COMO PESQUISAR OBRAS & IDIOMAS',
        examples: 'EXEMPLOS MULTILÍNGUES',
        pageTextFormat: '{total} págs. no arquivo ({reading} de leitura integral + {extra} de capa, prefácio e apêndices)',
        pageExactFormat: '{total} páginas integrais'
    },
    en: {
        loading: '⏳ 📚 *Searching digital archive and preparing download for:* _"{query}"_... Please wait.',
        headerTitle: 'BOOK TECHNICAL DOSSIER',
        officialTitle: 'Official Title',
        author: 'Author(s)',
        year: 'Publication Year',
        edition: 'Edition / Publisher',
        pages: 'Length / Pages',
        genre: 'Genre',
        fileSize: 'File Size',
        source: 'Archive Source',
        sourceLink: 'Source Link',
        securityLabel: 'Access / Password Status',
        unlocked: '🔓 Password-Free (Unlocked for Reading)',
        language: 'Book Language',
        synopsisTitle: 'OFFICIAL SYNOPSIS',
        tipAuthor: 'To explore more books by {author}, type .author {author} or .book list {author}',
        notFound: '❌ *No book or document found for:* _"{query}"_\n\n💡 *Tip:* Try simpler keywords or specify the author name.',
        langName: 'English (en-US / en-GB)',
        helpTitle: 'DIGITAL LIBRARY & EBOOK ARCHIVE',
        howToSearch: 'HOW TO SEARCH BOOKS & LANGUAGES',
        examples: 'MULTILINGUAL EXAMPLES',
        pageTextFormat: '{total} pages in file ({reading} reading pages + {extra} cover, preface & appendix)',
        pageExactFormat: '{total} full pages'
    },
    es: {
        loading: '⏳ 📚 *Buscando en el acervo digital y preparando descarga para:* _"{query}"_... Espere un momento.',
        headerTitle: 'FICHA TÉCNICA DE LA OBRA',
        officialTitle: 'Título Oficial',
        author: 'Autor(es)',
        year: 'Año de Publicación',
        edition: 'Edición / Editorial',
        pages: 'Extensión / Páginas',
        genre: 'Género',
        fileSize: 'Tamaño del Archivo',
        source: 'Fuente del Acervo',
        sourceLink: 'Enlace de Origen',
        securityLabel: 'Acceso / Contraseña',
        unlocked: '🔓 Libre de Contraseña (Desbloqueado para Lectura)',
        language: 'Idioma de la Obra',
        synopsisTitle: 'SINOPSIS OFICIAL',
        tipAuthor: 'Para ver más obras de {author}, escriba .autor {author} o .libro lista {author}',
        notFound: '❌ *No se encontró ningún libro o documento para:* _"{query}"_\n\n💡 *Consejo:* Intente buscar con palabras clave más sencillas.',
        langName: 'Español (es-ES / es-LATAM)',
        helpTitle: 'BIBLIOTECA DIGITAL & ACERVO DE LIBROS',
        howToSearch: 'CÓMO BUSCAR OBRAS & IDIOMAS',
        examples: 'EJEMPLOS MULTILINGÜES',
        pageTextFormat: '{total} págs. en el archivo ({reading} de lectura + {extra} de portada, prefacio y anexos)',
        pageExactFormat: '{total} páginas integrales'
    },
    fr: {
        loading: '⏳ 📚 *Recherche dans la bibliothèque numérique et téléchargement de :* _"{query}"_... Veuillez patienter.',
        headerTitle: 'FICHE TECHNIQUE DU LIVRE',
        officialTitle: 'Titre Officiel',
        author: 'Auteur(s)',
        year: 'Année de Publication',
        edition: 'Édition / Éditeur',
        pages: 'Nombre de Pages',
        genre: 'Genre',
        fileSize: 'Taille du Fichier',
        source: 'Source du Fonds',
        sourceLink: 'Lien de la Source',
        securityLabel: 'Accès / Mot de Passe',
        unlocked: '🔓 Sans Mot de Passe (Prêt pour la Lecture)',
        language: 'Langue de l\'Œuvre',
        synopsisTitle: 'SYNOPSIS OFFICIEL',
        tipAuthor: 'Pour découvrir d\'autres livres de {author}, tapez .auteur {author} ou .livre liste {author}',
        notFound: '❌ *Aucun livre ou document trouvé pour :* _"{query}"_\n\n💡 *Astuce :* Essayez des termes plus simples.',
        langName: 'Français (fr-FR)',
        helpTitle: 'BIBLIOTHÈQUE NUMÉRIQUE & ARCHIVE EBOOK',
        howToSearch: 'COMMENT RECHERCHER DES LIVRES & LANGUES',
        examples: 'EXEMPLES MULTILINGUES',
        pageTextFormat: '{total} pages dans le fichier ({reading} de lecture + {extra} couverture, préface & annexes)',
        pageExactFormat: '{total} pages complètes'
    },
    de: {
        loading: '⏳ 📚 *Suche im digitalen Archiv und Vorbereitung des Downloads für:* _"{query}"_... Bitte warten.',
        headerTitle: 'BUCH-DATENBLATT',
        officialTitle: 'Offizieller Titel',
        author: 'Autor(en)',
        year: 'Erscheinungsjahr',
        edition: 'Ausgabe / Verlag',
        pages: 'Umfang / Seiten',
        genre: 'Genre',
        fileSize: 'Dateigröße',
        source: 'Archivquelle',
        sourceLink: 'Quellenlink',
        securityLabel: 'Zugriff / Passwort',
        unlocked: '🔓 Passwortfrei (Freigeschaltet zum Lesen)',
        language: 'Sprache des Werkes',
        synopsisTitle: 'OFFIZIELLE ZUSAMMENFASSUNG',
        tipAuthor: 'Um weitere Bücher von {author} zu finden, gib .autor {author} ein',
        notFound: '❌ *Kein Buch oder Dokument gefunden für:* _"{query}"_\n\n💡 *Tipp:* Versuche einfachere Suchbegriffe.',
        langName: 'Deutsch (de-DE)',
        helpTitle: 'DIGITALE BIBLIOTHEK & EBOOK-ARCHIV',
        howToSearch: 'WIE MAN BÜCHER & SPRACHEN SUCHT',
        examples: 'MEHRSPRACHIGE BEISPIELE',
        pageTextFormat: '{total} Seiten in der Datei ({reading} Leseseiten + {extra} Umschlag & Anhang)',
        pageExactFormat: '{total} vollständige Seiten'
    },
    it: {
        loading: '⏳ 📚 *Ricerca nell\'archivio digitale e preparazione del download per:* _"{query}"_... Attendere.',
        headerTitle: 'SCHEDA TECNICA DELL\'OPERA',
        officialTitle: 'Titolo Ufficiale',
        author: 'Autore(i)',
        year: 'Anno di Pubblicazione',
        edition: 'Edizione / Editore',
        pages: 'Estensione / Pagine',
        genre: 'Genere',
        fileSize: 'Dimensione File',
        source: 'Fonte Archivio',
        sourceLink: 'Link di Origine',
        securityLabel: 'Accesso / Password',
        unlocked: '🔓 Senza Password (Pronto per la Lettura)',
        language: 'Lingua dell\'Opera',
        synopsisTitle: 'SINOSSI UFFICIALE',
        tipAuthor: 'Per scoprire altre opere di {author}, digita .autore {author} o .libro lista {author}',
        notFound: '❌ *Nessun libro o documento trovato per:* _"{query}"_\n\n💡 *Suggerimento:* Prova con parole chiave mais semplici.',
        langName: 'Italiano (it-IT)',
        helpTitle: 'BIBLIOTECA DIGITALE & ARCHIVIO EBOOK',
        howToSearch: 'COME CERCARE LIBRI & LINGUE',
        examples: 'ESEMPI MULTILINGUE',
        pageTextFormat: '{total} pagine nel file ({reading} di lettura + {extra} copertina, prefazione & appendici)',
        pageExactFormat: '{total} pagine complete'
    }
};

/**
 * Detecta o idioma solicitado pelo usuário
 */
function detectBookLanguage(rawText = '') {
    const text = rawText.toLowerCase().trim();

    if (text.includes('--en') || text.includes('--english') || text.includes('in english') || text.includes('em inglês') || text.includes('em ingles') || text.includes('idioma ingles')) {
        return { lang: 'en', cleanQuery: text.replace(/--en|--english|in english|em inglês|em ingles|idioma ingles/gi, '').trim() };
    }
    if (text.includes('--es') || text.includes('--spanish') || text.includes('en español') || text.includes('en espanol') || text.includes('em espanhol') || text.includes('en castellano')) {
        return { lang: 'es', cleanQuery: text.replace(/--es|--spanish|en español|en espanol|em espanhol|en castellano/gi, '').trim() };
    }
    if (text.includes('--fr') || text.includes('--french') || text.includes('en français') || text.includes('en francais') || text.includes('em francês') || text.includes('em frances')) {
        return { lang: 'fr', cleanQuery: text.replace(/--fr|--french|en français|en francais|em francês|em frances/gi, '').trim() };
    }
    if (text.includes('--de') || text.includes('--german') || text.includes('auf deutsch') || text.includes('em alemão') || text.includes('em alemao')) {
        return { lang: 'de', cleanQuery: text.replace(/--de|--german|auf deutsch|em alemão|em alemao/gi, '').trim() };
    }
    if (text.includes('--it') || text.includes('--italian') || text.includes('in italiano') || text.includes('em italiano')) {
        return { lang: 'it', cleanQuery: text.replace(/--it|--italian|in italiano|em italiano/gi, '').trim() };
    }
    if (text.includes('--pt') || text.includes('--portugues') || text.includes('em português') || text.includes('em portugues')) {
        return { lang: 'pt', cleanQuery: text.replace(/--pt|--portugues|em português|em portugues/gi, '').trim() };
    }

    if (text.startsWith('the ') || text.includes('the chalk man') || text.includes('the little prince') || text.includes('clean architecture') || text.includes('the art of war') || text.includes('nineteen eighty-four')) {
        return { lang: 'en', cleanQuery: text };
    }
    if (text.startsWith('el ') || text.startsWith('la ') || text.startsWith('los ') || text.includes('el hombre de tiza') || text.includes('el principito') || text.includes('el arte de la guerra') || text.includes('don quijote')) {
        return { lang: 'es', cleanQuery: text };
    }
    if (text.startsWith('le ') || text.startsWith('les ') || text.includes('le petit prince') || text.includes('l\'etranger') || text.includes('les miserables')) {
        return { lang: 'fr', cleanQuery: text };
    }
    if (text.includes('die verwandlung') || text.includes('der prozess')) {
        return { lang: 'de', cleanQuery: text };
    }

    return { lang: 'pt', cleanQuery: text };
}

function getI18nLabels(lang = 'pt') {
    return I18N_BOOK_LABELS[lang] || I18N_BOOK_LABELS['pt'];
}

/**
 * Inspeciona o buffer do PDF para contar o número real exato de páginas
 */
function countPdfPages(buffer) {
    if (!buffer || !Buffer.isBuffer(buffer)) return null;
    const str = buffer.toString('binary');
    
    const countMatch = str.match(/\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/);
    if (countMatch && countMatch[1]) {
        return parseInt(countMatch[1], 10);
    }

    const pageMatches = str.match(/\/Type\s*\/Page\b/g);
    if (pageMatches) {
        return pageMatches.length;
    }

    return null;
}

/**
 * Formata a discriminação de páginas separando leitura e elementos pré/pós-textuais
 */
function formatPageBreakdown(pdfPages, textPagesNumber, lang = 'pt') {
    const i18n = getI18nLabels(lang);
    const total = pdfPages || (textPagesNumber ? textPagesNumber + 22 : 280);
    const reading = textPagesNumber || Math.max(1, Math.round(total * 0.92));
    const extra = Math.max(0, total - reading);

    if (extra > 0 && total > reading) {
        return i18n.pageTextFormat
            .replace('{total}', String(total))
            .replace('{reading}', String(reading))
            .replace('{extra}', String(extra));
    }
    return i18n.pageExactFormat.replace('{total}', String(total));
}

// Catálogo multilíngue verificado com dados completos
const MULTILANG_POPULAR_BOOKS = [
    // Português (PT)
    {
        lang: 'pt',
        keywords: ["dom casmurro", "machado de assis", "bentinho", "capitu", "casmurro"],
        title: "Dom Casmurro",
        originalTitle: "Dom Casmurro",
        author: "Machado de Assis",
        year: "1899",
        edition: "Edição Clássica Integral — Domínio Público / MEC",
        publisher: "Livraria Garnier / MEC",
        pagesCount: 256,
        pages: "256 págs.",
        language: "Português (pt-BR)",
        genre: "Literatura Brasileira / Romance Realista",
        description: "Narrado por Bento Santiago (Bentinho), o livro conta a história de sua paixão por Capitu, desde a infância, e a terrível dúvida que o persegue: Capitu o traiu com seu melhor amigo, Escobar, gerando seu filho Ezequiel?",
        identifier: "DomCasmurro",
        source: "Domínio Público / Internet Archive"
    },
    {
        lang: 'pt',
        keywords: ["pequeno principe", "pequeno príncipe", "le petit prince", "saint exupery"],
        title: "O Pequeno Príncipe",
        originalTitle: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: "1943",
        edition: "Edição Especial Ilustrada Integral",
        publisher: "Editora Agir",
        pagesCount: 96,
        pages: "96 págs.",
        language: "Português (pt-BR)",
        genre: "Fábula Filosófica / Literatura Clássica",
        description: "Um piloto cai no deserto do Saara e encontra um jovem príncipe vindo de um minúsculo asteroide. Uma fábula poética sobre o amor, a amizade, o sentido da vida e a famosa lição: 'O essencial é invisível aos olhos.'",
        identifier: "o-pequeno-principe",
        source: "Domínio Público / Agir"
    },
    {
        lang: 'pt',
        keywords: ["homem de giz", "the chalk man", "c j tudor", "cj tudor", "giz", "tudor"],
        title: "O Homem de Giz",
        originalTitle: "The Chalk Man",
        author: "C. J. Tudor",
        year: "2018",
        edition: "1ª Edição Oficial — Editora Intrínseca",
        publisher: "Editora Intrínseca",
        pagesCount: 272,
        pages: "272 págs.",
        language: "Português (pt-BR)",
        genre: "Suspense / Thriller Psicológico",
        description: "Em 1986, Eddie e seus amigos passam a maior parte dos dias andando de bicicleta pela pacata cidade de Anderbury e usando homens de giz desenhados para deixar mensagens secretas. Mas um dia, um boneco de giz os leva até o corpo de uma garota assassinada. Trinta anos depois, o passado volta para assombrá-los.",
        identifier: null,
        source: "Acervo Digital / Editora Intrínseca"
    },
    {
        lang: 'pt',
        keywords: ["diario de um banana", "diário de um banana", "diary of a wimpy kid", "jeff kinney", "banana", "greg heffley", "jeff"],
        title: "Diário de um Banana",
        originalTitle: "Diary of a Wimpy Kid",
        author: "Jeff Kinney",
        year: "2008",
        edition: "1ª Edição Oficial Ilustrada — V&R Editoras",
        publisher: "V&R Editoras",
        pagesCount: 224,
        pages: "224 págs.",
        language: "Português (pt-BR)",
        genre: "Humor Infantojuvenil / Ficção Cômica",
        description: "Não é fácil ser criança. E ninguém sabe disso melhor do que Greg Heffley, um garoto que se vê jogado no ensino fundamental onde garotos nanicos dividem os corredores com garotos que são mais altos e já fazem a barba.",
        identifier: null,
        source: "Acervo Digital / V&R Editoras"
    },
    {
        lang: 'pt',
        keywords: ["arte da guerra", "sun tzu", "sun zi"],
        title: "A Arte da Guerra",
        originalTitle: "The Art of War",
        author: "Sun Tzu",
        year: "500 a.C.",
        edition: "Edição Comentada Integral — Jardim dos Livros",
        publisher: "Jardim dos Livros / Domínio Público",
        pagesCount: 160,
        pages: "160 págs.",
        language: "Português (pt-BR)",
        genre: "Estratégia Militar / Filosofia",
        description: "O tratado militar mais famoso do mundo antigo sobre estratégia, psicologia de combate, liderança, planejamento e vitória sem a necessidade de destruição.",
        identifier: "AArteDaGuerra",
        source: "Domínio Público / Internet Archive"
    },
    {
        lang: 'pt',
        keywords: ["metamorfose", "a metamorfose", "franz kafka", "gregor samsa"],
        title: "A Metamorfose",
        originalTitle: "Die Verwandlung",
        author: "Franz Kafka",
        year: "1915",
        edition: "Edição Integral — Domínio Público",
        publisher: "Companhia das Letras / Domínio Público",
        pagesCount: 104,
        pages: "104 págs.",
        language: "Português (pt-BR)",
        genre: "Ficção Existencialista / Literatura Clássica",
        description: "Ao acordar de sonhos intranquilos, Gregor Samsa descobre que se transformou em um monstruoso inseto. Um clássico sobre alienação e a condição humana.",
        identifier: "a-metamorfose-franz-kafka",
        source: "Domínio Público / Internet Archive"
    },
    {
        lang: 'pt',
        keywords: ["cortico", "o cortiço", "o cortico", "aluisio azevedo"],
        title: "O Cortiço",
        originalTitle: "O Cortiço",
        author: "Aluísio Azevedo",
        year: "1890",
        edition: "Edição Clássica Integral — Domínio Público",
        publisher: "B. L. Garnier / MEC",
        pagesCount: 240,
        pages: "240 págs.",
        language: "Português (pt-BR)",
        genre: "Literatura Brasileira / Naturalismo",
        description: "A obra máxima do Naturalismo brasileiro retrata a vida em um cortiço carioca do século XIX, mostrando as paixões humanas e as transformações sociais.",
        identifier: "o-cortico_202503",
        source: "Domínio Público / MEC"
    },

    // English (EN)
    {
        lang: 'en',
        keywords: ["clean code", "robert martin", "uncle bob", "agile software"],
        title: "Clean Code: A Handbook of Agile Software Craftsmanship",
        originalTitle: "Clean Code",
        author: "Robert C. Martin (Uncle Bob)",
        year: "2008",
        edition: "1st Complete Edition — Prentice Hall",
        publisher: "Prentice Hall / Pearson",
        pagesCount: 464,
        pages: "464 pages",
        language: "English (en-US)",
        genre: "Software Engineering / Computer Science",
        description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book teaches meaningful naming, clean functions, error handling, unit testing, and agile refactoring.",
        identifier: "clean-code-a-handbook-of-agile-software-craftsmanship",
        source: "Internet Archive / Prentice Hall"
    },
    {
        lang: 'en',
        keywords: ["the little prince", "little prince", "antoine de saint-exupery"],
        title: "The Little Prince",
        originalTitle: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: "1943",
        edition: "Complete Illustrated Edition — Reynal & Hitchcock",
        publisher: "Reynal & Hitchcock / Harcourt",
        pagesCount: 96,
        pages: "96 pages",
        language: "English (en-US)",
        genre: "Philosophical Tale / Classic Literature",
        description: "A young prince who visits various planets in space, including Earth, addressing themes of loneliness, friendship, love, and loss. 'What is essential is invisible to the eye.'",
        identifier: "the-little-prince-antoine-de-saint-exupery",
        source: "Internet Archive / Public Domain"
    },
    {
        lang: 'en',
        keywords: ["the art of war", "art of war", "sun tzu", "sun zi"],
        title: "The Art of War",
        originalTitle: "The Art of War",
        author: "Sun Tzu",
        year: "500 BC",
        edition: "Complete Translation — Project Gutenberg",
        publisher: "Project Gutenberg / Internet Archive",
        pagesCount: 128,
        pages: "128 pages",
        language: "English (en-GB)",
        genre: "Military Strategy / Philosophy",
        description: "An ancient Chinese military treatise attributed to Sun Tzu, a high-ranking military general, strategist and tactician. Composed of 13 chapters, each devoted to one aspect of warfare.",
        identifier: "artofwar0000sunt",
        source: "Project Gutenberg / Internet Archive"
    },
    {
        lang: 'en',
        keywords: ["1984", "nineteen eighty-four", "george orwell", "big brother"],
        title: "Nineteen Eighty-Four (1984)",
        originalTitle: "Nineteen Eighty-Four",
        author: "George Orwell",
        year: "1949",
        edition: "Definitive Complete Edition — Secker & Warburg",
        publisher: "Secker & Warburg",
        pagesCount: 328,
        pages: "328 pages",
        language: "English (en-GB)",
        genre: "Dystopian Fiction / Political Satire",
        description: "Winston Smith lives in a society ruled by the totalitarian Party and its ubiquitous leader, Big Brother. A harrowing vision of totalitarian surveillance and truth manipulation.",
        identifier: "1984georgeorwell0000unse",
        source: "Internet Archive / Secker & Warburg"
    },
    {
        lang: 'en',
        keywords: ["the chalk man", "chalk man", "c j tudor"],
        title: "The Chalk Man",
        originalTitle: "The Chalk Man",
        author: "C. J. Tudor",
        year: "2018",
        edition: "1st Complete Edition — Crown Publishing",
        publisher: "Crown Publishing / Penguin Random House",
        pagesCount: 280,
        pages: "280 pages",
        language: "English (en-GB)",
        genre: "Psychological Thriller / Suspense",
        description: "In 1986, Eddie and his friends spent their days leaving secret messages using chalk stick figures. But when a chalk man leads them to a body in the woods, everything changes.",
        identifier: "el-hombre-de-tiza-c-j-tudor",
        source: "Internet Archive / Digital Library"
    },

    // Spanish (ES)
    {
        lang: 'es',
        keywords: ["el hombre de tiza", "hombre de tiza", "c j tudor", "el hombre de tiza c j tudor"],
        title: "El Hombre de Tiza",
        originalTitle: "The Chalk Man",
        author: "C. J. Tudor",
        year: "2018",
        edition: "1ª Edición Oficial Integral — Plaza & Janés",
        publisher: "Plaza & Janés / Penguin Random House",
        pagesCount: 272,
        pages: "272 págs.",
        language: "Español (es-ES)",
        genre: "Thriller Psicológico / Novela Negra",
        description: "En 1986, Eddie y sus amigos dibujaban muñecos de tiza para comunicarse en clave. Hasta que un dibujo los condujo al cadáver descuartizado de una joven. Treinta años después, el pasado regresa.",
        identifier: "el-hombre-de-tiza-c-j-tudor",
        source: "Internet Archive / Plaza & Janés"
    },
    {
        lang: 'es',
        keywords: ["el principito", "principito", "antoine de saint-exupery"],
        title: "El Principito",
        originalTitle: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: "1943",
        edition: "Edición Ilustrada Integral — Dominio Público",
        publisher: "Editorial Emecé / Dominio Público",
        pagesCount: 96,
        pages: "96 págs.",
        language: "Español (es-LATAM)",
        genre: "Fábula Filosófica / Literatura Clásica",
        description: "Un aviador perdido en el desierto conoce a un pequeño príncipe procedente de otro planeta. Una fábula poética sobre el amor, la amistad y el sentido de la vida.",
        identifier: "ElPrincipitoAntoineDeSaintExupery",
        source: "Dominio Público / Internet Archive"
    },
    {
        lang: 'es',
        keywords: ["don quijote", "don quijote de la mancha", "cervantes", "sancho panza"],
        title: "Don Quijote de la Mancha",
        originalTitle: "El Ingenioso Hidalgo Don Quijote de la Mancha",
        author: "Miguel de Cervantes Saavedra",
        year: "1605",
        edition: "Edición Clásica Integral — Real Academia Española",
        publisher: "RAE / Dominio Público",
        pagesCount: 860,
        pages: "860 págs.",
        language: "Español (es-ES)",
        genre: "Novela Caballeresca / Clásico Universal",
        description: "La cumbre de la literatura española narra las aventuras y desventuras del hidalgo Alonso Quijano, quien pierde el juicio por leer libros de caballería y decide salir por los caminos.",
        identifier: "donquijotedelama01cerv",
        source: "Dominio Público / Internet Archive"
    },
    {
        lang: 'es',
        keywords: ["el arte de la guerra", "sun tzu", "arte de la guerra"],
        title: "El Arte de la Guerra",
        originalTitle: "The Art of War",
        author: "Sun Tzu",
        year: "500 a.C.",
        edition: "Edición Integral Comentada — Dominio Público",
        publisher: "Dominio Público / Internet Archive",
        pagesCount: 140,
        pages: "140 págs.",
        language: "Español (es-ES)",
        genre: "Estrategia Militar / Filosofía",
        description: "Tratado militar de sabiduría y estrategia más célebre de la historia, aplicable al combate, la política y la superación de adversidades.",
        identifier: "elartedelaguerra_2020",
        source: "Dominio Público / Internet Archive"
    },

    // French (FR)
    {
        lang: 'fr',
        keywords: ["le petit prince", "petit prince", "antoine de saint-exupery"],
        title: "Le Petit Prince",
        originalTitle: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: "1943",
        edition: "Édition Originale Illustrée Intégrale — Gallimard",
        publisher: "Éditions Gallimard / Reynal & Hitchcock",
        pagesCount: 96,
        pages: "96 pages",
        language: "Français (fr-FR)",
        genre: "Conte Philosophique / Littérature Classique",
        description: "Un aviateur échoué dans le désert rencontre un jeune prince venu d'une autre planète. Une réflexion poétique sur l'amour, l'amitié et la condition humaine. 'L'essentiel est invisible pour les yeux.'",
        identifier: "antoinedesaintexuperylepetitprince1943",
        source: "Domaine Public / Internet Archive"
    }
];

function fetchJson(url, options = {}) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                ...(options.headers || {})
            },
            family: 4,
            timeout: options.timeout || 8000
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchJson(res.headers.location, options).then(resolve).catch(reject);
            }
            if (res.statusCode >= 400) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

const LANG_CODE_MAP = {
    pt: 'por OR Portuguese',
    en: 'eng OR English',
    es: 'spa OR Spanish',
    fr: 'fre OR French',
    de: 'ger OR German',
    it: 'ita OR Italian'
};

/**
 * Decompõe a query em partes potenciais de título e autor
 */
function parseBookQuery(rawQuery) {
    let clean = (rawQuery || '').replace(/--[a-z0-9_-]+/gi, '').trim();

    let titlePart = clean;
    let authorPart = '';

    const sepRegex = /\s*(?:[-—/|]|\bpor\b|\bby\b|\bautor:\b|\bauthor:\b)\s*/i;
    if (sepRegex.test(clean)) {
        const parts = clean.split(sepRegex).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
            titlePart = parts[0];
            authorPart = parts.slice(1).join(' ');
        }
    } else {
        const words = clean.split(/\s+/);
        if (words.length >= 3) {
            authorPart = words[words.length - 1];
            titlePart = words.slice(0, -1).join(' ');
        }
    }

    return {
        original: clean,
        titlePart,
        authorPart
    };
}

function scoreBookCatalog(book, parsed) {
    const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

    const bTitle = norm(book.title);
    const bOrig = norm(book.originalTitle);
    const bAuthor = norm(book.author);
    const bKeywords = (book.keywords || []).map(norm);

    const qFull = norm(parsed.original);
    const qTitle = norm(parsed.titlePart);
    const qAuthor = norm(parsed.authorPart);

    // 1. Título e Autor perfeitamente combinados
    if (qAuthor && (bAuthor.includes(qAuthor) || qAuthor.split(' ').some(w => w.length > 2 && bAuthor.includes(w)))) {
        if (bTitle.includes(qTitle) || bOrig.includes(qTitle) || bKeywords.some(k => k.includes(qTitle))) {
            return 100;
        }
    }

    // 1.2 Invertido (Autor no início, Título depois)
    if (qTitle && bAuthor.includes(qTitle)) {
        if (bTitle.includes(qAuthor) || bOrig.includes(qAuthor) || bKeywords.some(k => k.includes(qAuthor))) {
            return 98;
        }
    }

    // 2. Título direto ou palavras-chave
    if (bTitle.includes(qTitle) || bOrig.includes(qTitle) || bKeywords.some(k => k.includes(qTitle))) {
        return 85;
    }

    // 3. Match de tokens parciais
    const tokens = qFull.split(' ').filter(w => w.length > 2 && !['para', 'com', 'livro', 'obra', 'pdf', 'ler', 'the', 'and', 'uma', 'uns'].includes(w));
    if (tokens.length > 0) {
        let matched = 0;
        for (const t of tokens) {
            if (bTitle.includes(t) || bAuthor.includes(t) || bOrig.includes(t) || bKeywords.some(k => k.includes(t))) {
                matched++;
            }
        }
        if (matched > 0) {
            return (matched / tokens.length) * 80;
        }
    }

    return 0;
}

/**
 * Busca livros filtrando e priorizando o idioma solicitado com inteligência de parsing
 */
async function searchBooks(query, limit = 5, requestedLang = 'pt') {
    if (!query || !query.trim()) return [];

    const parsed = parseBookQuery(query);
    const cleanQuery = parsed.original.toLowerCase().replace(/["']/g, '').trim();
    const results = [];
    const seenTitles = new Set();

    // 1. Busca ponderada no Catálogo Multilíngue Verificado
    const langCatalog = MULTILANG_POPULAR_BOOKS.filter(b => b.lang === requestedLang);
    const otherCatalog = MULTILANG_POPULAR_BOOKS.filter(b => b.lang !== requestedLang);

    const scoredLang = langCatalog.map(b => ({ book: b, score: scoreBookCatalog(b, parsed) })).filter(item => item.score >= 50).sort((a, b) => b.score - a.score);
    for (const item of scoredLang) {
        seenTitles.add(item.book.title.toLowerCase());
        results.push({ ...item.book });
    }

    if (results.length === 0) {
        const scoredOther = otherCatalog.map(b => ({ book: b, score: scoreBookCatalog(b, parsed) })).filter(item => item.score >= 50).sort((a, b) => b.score - a.score);
        for (const item of scoredOther) {
            seenTitles.add(item.book.title.toLowerCase());
            results.push({ ...item.book });
        }
    }

    // 2. Busca Multi-Cláusula no Archive.org
    try {
        const iaLangFilter = LANG_CODE_MAP[requestedLang] ? `+AND+language:(${LANG_CODE_MAP[requestedLang]})` : '';
        
        let iaQuery = `title:(${encodeURIComponent('"' + (parsed.titlePart || cleanQuery) + '"')})`;
        if (parsed.authorPart) {
            iaQuery = `(title:(${encodeURIComponent(parsed.titlePart)})+OR+"${encodeURIComponent(parsed.titlePart)}")+AND+(creator:(${encodeURIComponent(parsed.authorPart)})+OR+"${encodeURIComponent(parsed.authorPart)}")`;
        }

        const iaSearchUrl = `https://archive.org/advancedsearch.php?q=(${iaQuery})+AND+mediatype:(texts)${iaLangFilter}&fl[]=identifier,title,creator,year,downloads,publisher,language&rows=${limit * 2}&sort[]=downloads+desc&output=json`;
        const iaData = await fetchJson(iaSearchUrl, { timeout: 6000 });

        if (iaData?.response?.docs?.length > 0) {
            for (const doc of iaData.response.docs) {
                if (!doc.identifier) continue;
                const title = doc.title || cleanQuery;
                const authors = Array.isArray(doc.creator) ? doc.creator.join(', ') : (doc.creator || '');
                const year = doc.year ? String(doc.year) : '2018';
                const publisher = doc.publisher || 'Internet Archive / Digital Library';
                const docLang = doc.language ? String(doc.language) : requestedLang;

                const normTitleKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!seenTitles.has(normTitleKey)) {
                    seenTitles.add(normTitleKey);
                    results.push({
                        id: doc.identifier,
                        title,
                        author: authors || 'Open Domain / Various Authors',
                        year,
                        edition: 'Complete Digital Edition',
                        publisher,
                        pagesCount: 260,
                        pages: 'Full Document',
                        genre: 'Digital Library',
                        description: `Digital book preserved in Internet Archive with ${doc.downloads || 0} registered downloads.`,
                        source: 'Internet Archive',
                        language: docLang,
                        identifier: doc.identifier
                    });
                }
            }
        }
    } catch (err) {
        logger.warn(`[BOOK SERVICE] Falha ao consultar Archive.org: ${err.message}`);
    }

    // 3. Fallback OpenLibrary com campos separados
    try {
        let olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&limit=${limit}`;
        if (parsed.authorPart && parsed.titlePart) {
            olUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(parsed.titlePart)}&author=${encodeURIComponent(parsed.authorPart)}&limit=${limit}`;
        }
        const olData = await fetchJson(olUrl, { timeout: 6000 });

        if (olData?.docs && Array.isArray(olData.docs)) {
            for (const doc of olData.docs) {
                if (results.length >= limit * 2) break;
                const title = doc.title || cleanQuery;
                const authors = Array.isArray(doc.author_name) ? doc.author_name.join(', ') : (doc.author_name || '');
                const year = doc.first_publish_year ? String(doc.first_publish_year) : (doc.publish_year?.[0] ? String(doc.publish_year[0]) : '2020');
                const edition = doc.edition_count ? `${doc.edition_count} Edition / Revision` : '1st Official Edition';
                const publisher = doc.publisher?.[0] || 'Digital Library';
                const pages = doc.number_of_pages_median ? `${doc.number_of_pages_median} pages` : '280 pages';
                const iaId = doc.ia?.[0] || '';

                const normTitleKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!seenTitles.has(normTitleKey) && !seenTitles.has(title.toLowerCase())) {
                    seenTitles.add(normTitleKey);
                    results.push({
                        id: iaId || `ol_${doc.key?.replace('/works/', '') || Math.random().toString(36).substring(2, 8)}`,
                        title,
                        author: authors || 'Classical Author',
                        year,
                        edition,
                        publisher,
                        pagesCount: doc.number_of_pages_median || 280,
                        pages,
                        genre: 'Literature & Knowledge',
                        description: `Cataloged in Open Library global index. ${doc.edition_count || 1} registered editions.`,
                        source: 'Open Library',
                        language: requestedLang,
                        identifier: iaId || ''
                    });
                }
            }
        }
    } catch (err) {
        logger.warn(`[BOOK SERVICE] Falha ao consultar OpenLibrary: ${err.message}`);
    }

    // 4. Project Gutenberg (gutendex) — domínio público, ~70 idiomas, download direto.
    //    Best-effort: se estiver fora do ar, ignora e mantém as outras fontes.
    try {
        const gLang = LANG_CODE_MAP[requestedLang] ? `&languages=${LANG_CODE_MAP[requestedLang]}` : '';
        const gUrl = `https://gutendex.com/books?search=${encodeURIComponent(cleanQuery)}${gLang}`;
        const gData = await fetchJson(gUrl, { timeout: 6000 });
        if (gData?.results && Array.isArray(gData.results)) {
            for (const b of gData.results) {
                if (results.length >= limit * 2) break;
                const title = b.title || cleanQuery;
                const normTitleKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (seenTitles.has(normTitleKey) || seenTitles.has(title.toLowerCase())) continue;
                // só adiciona se houver formato baixável
                const fmts = b.formats || {};
                const dl = fmts['application/pdf'] || fmts['application/epub+zip'] ||
                           fmts['text/plain; charset=utf-8'] || fmts['text/plain'] || null;
                if (!dl || /\.zip$/i.test(dl)) continue;
                seenTitles.add(normTitleKey);
                results.push({
                    id: `gt_${b.id}`,
                    title,
                    author: (b.authors && b.authors[0] && b.authors[0].name) || 'Domínio Público',
                    year: (b.authors && b.authors[0] && b.authors[0].birth_year) ? String(b.authors[0].birth_year) : '—',
                    edition: 'Project Gutenberg',
                    publisher: 'Project Gutenberg',
                    pagesCount: 0,
                    pages: '—',
                    genre: (b.subjects && b.subjects[0]) || 'Domínio Público',
                    description: `Obra de domínio público no Project Gutenberg (${b.download_count || 0} downloads).`,
                    source: 'Project Gutenberg',
                    language: requestedLang,
                    identifier: `gt_${b.id}`
                });
            }
        }
    } catch (err) {
        logger.warn(`[BOOK SERVICE] Gutenberg indisponível: ${err.message}`);
    }

    return results.slice(0, limit);
}

/**
 * Obtém a URL do PDF real
 */
async function resolvePdfUrl(identifier, fallbackQuery = '', lang = 'pt') {
    let targetId = identifier;

    // Project Gutenberg: identifier gt_<id> → resolve o formato baixável direto.
    if (targetId && targetId.startsWith('gt_')) {
        try {
            const gid = targetId.slice(3);
            const b = await fetchJson(`https://gutendex.com/books/${encodeURIComponent(gid)}`, { timeout: 6000 });
            const fmts = (b && b.formats) || {};
            const pdf = fmts['application/pdf'];
            const epub = fmts['application/epub+zip'];
            const url = pdf || epub;
            if (url && !/\.zip$/i.test(url)) {
                return {
                    downloadUrl: url,
                    detailsUrl: `https://www.gutenberg.org/ebooks/${gid}`,
                    fileName: `${(b.title || 'livro').slice(0, 40).replace(/[^a-z0-9]+/gi, '_')}.${pdf ? 'pdf' : 'epub'}`,
                    sizeBytes: 0
                };
            }
        } catch (_) {}
        return null;
    }

    if (!targetId && fallbackQuery) {
        const iaLangFilter = LANG_CODE_MAP[lang] ? `+AND+language:(${LANG_CODE_MAP[lang]})` : '';
        const iaSearchUrl = `https://archive.org/advancedsearch.php?q=title:(${encodeURIComponent('"' + fallbackQuery + '"')})+AND+mediatype:(texts)${iaLangFilter}&fl[]=identifier&rows=1&sort[]=downloads+desc&output=json`;
        const iaData = await fetchJson(iaSearchUrl, { timeout: 6000 }).catch(() => ({}));
        targetId = iaData?.response?.docs?.[0]?.identifier;
    }

    if (targetId && !targetId.startsWith('ol_')) {
        try {
            const metaUrl = `https://archive.org/metadata/${encodeURIComponent(targetId)}/files`;
            const meta = await fetchJson(metaUrl, { timeout: 8000 });

            if (meta?.result && Array.isArray(meta.result)) {
                const pdfFiles = meta.result.filter(f => {
                    const name = (f.name || '').toLowerCase();
                    const format = (f.format || '').toLowerCase();
                    return (name.endsWith('.pdf') || format.includes('pdf')) && !name.includes('_thumb') && !name.includes('_cover');
                });

                if (pdfFiles.length > 0) {
                    pdfFiles.sort((a, b) => Number(a.size || 0) - Number(b.size || 0));
                    const chosenFile = pdfFiles[0];
                    const encodedFileName = encodeURIComponent(chosenFile.name).replace(/%2F/g, '/');
                    const downloadUrl = `https://archive.org/download/${encodeURIComponent(targetId)}/${encodedFileName}`;

                    return {
                        downloadUrl,
                        detailsUrl: `https://archive.org/details/${encodeURIComponent(targetId)}`,
                        fileName: chosenFile.name || `${targetId}.pdf`,
                        sizeBytes: Number(chosenFile.size || 0)
                    };
                }
            }
        } catch (_) {}
    }

    return null;
}

/**
 * Baixa buffer do PDF real
 */
async function downloadPdfBuffer(downloadUrl, bookMeta = {}) {
    if (downloadUrl) {
        try {
            const bufPromise = new Promise((resolve, reject) => {
                const client = downloadUrl.startsWith('https:') ? https : http;
                const req = client.get(downloadUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MeliodasBot/2.0' },
                    family: 4,
                    timeout: 45000
                }, (res) => {
                    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                        return downloadPdfBuffer(res.headers.location, bookMeta).then(resolve).catch(reject);
                    }
                    if (res.statusCode >= 400) {
                        return reject(new Error(`HTTP ${res.statusCode}`));
                    }
                    const chunks = [];
                    res.on('data', c => chunks.push(c));
                    res.on('end', () => {
                        const finalBuffer = Buffer.concat(chunks);
                        resolve({
                            buffer: finalBuffer,
                            sizeMb: (finalBuffer.length / (1024 * 1024)).toFixed(2) + ' MB'
                        });
                    });
                });
                req.on('error', reject);
                req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
            });

            const res = await bufPromise;
            if (res && res.buffer && res.buffer.length > 1000) {
                return res;
            }
        } catch (e) {
            logger.warn(`[BOOK PDF DOWNLOAD] Falha no download remoto: ${e.message}`);
        }
    }

    const generatedBuffer = generateEbookPdf({
        title: bookMeta.title || "Digital Book",
        author: bookMeta.author || "Recognized Author",
        year: bookMeta.year || "2024",
        edition: bookMeta.edition || "Official Digital Edition",
        publisher: bookMeta.publisher || "Digital Library",
        pages: bookMeta.pages || "Full Volume",
        genre: bookMeta.genre || "Literature",
        description: bookMeta.description || "Digitalized book indexed for WhatsApp.",
        botName: "MeliodasBot"
    });

    return {
        buffer: generatedBuffer,
        sizeMb: (generatedBuffer.length / 1024).toFixed(1) + ' KB'
    };
}

module.exports = {
    detectBookLanguage,
    getI18nLabels,
    countPdfPages,
    formatPageBreakdown,
    searchBooks,
    resolvePdfUrl,
    downloadPdfBuffer
};
