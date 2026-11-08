import { useRoute } from './lib/router'
import Layout from './components/Layout'
import Home from './pages/Home'
import ChapterPage from './pages/ChapterPage'
import TopicPage from './pages/TopicPage'
import Flashcards from './pages/Flashcards'
import Practice from './pages/Practice'
import Exam from './pages/Exam'
import WrongBook from './pages/WrongBook'
import ProgressPage from './pages/ProgressPage'
import FullExams from './pages/FullExams'

export default function App() {
  const route = useRoute()
  const [page, id] = route.parts
  const key = route.path + JSON.stringify(route.query)

  let view
  switch (page) {
    case 'chuong':
      view = <ChapterPage id={id} />
      break
    case 'chu-de':
      view = <TopicPage id={id} />
      break
    case 'the-nho':
      view = <Flashcards key={key} query={route.query} />
      break
    case 'luyen-tap':
      view = <Practice key={key} query={route.query} />
      break
    case 'thi-thu':
      view = <Exam key={key} query={route.query} />
      break
    case 'de':
      view = <FullExams id={id} />
      break
    case 'so-cau-sai':
      view = <WrongBook />
      break
    case 'tien-do':
      view = <ProgressPage />
      break
    default:
      view = <Home />
  }

  return <Layout route={route}>{view}</Layout>
}
