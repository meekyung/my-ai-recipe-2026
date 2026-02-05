// import {supabase} from '/utils/supabase.ts'
import { useState } from 'react'

type RecipeResult = {
  title: string;
  recipe: string;
  image_url?: string;  
}
type ErrorResponse = {
  status?: number;
  error?: string;
  detail?:unknown; // 추가적인 오류 세부 정보
}

function App() {
  const [title, setTitle] = useState<string>('');
  const [result, setResult] = useState<RecipeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  const handleGenerateRecipe = async () => {
    setLoading(true);
    setResult(null); // 이전 결과 초기화

    try {
      const BASEURL = import.meta.env.VITE_SUPABASE_URL || '';
      const PUBKEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
      const ANONKEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      if(!BASEURL || !PUBKEY || !ANONKEY) {
        alert('Supabase 환경 변수가 설정되지 않았습니다.');
        setLoading(false);
        return;
      }
      const url = `${BASEURL}/functions/v1/recipe`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',          
          'apikey': ANONKEY, //익명 액세스에 필요
        },
        body: JSON.stringify({ title }),
      });
      if(!response.ok) {
        const text = await response.text();
        try{
          const error = JSON.parse(text) as ErrorResponse;
          const insufficientInfo = (response.status === 429) || (error.error === 'openai_recipe_failed' && error.detail === 'Insufficient_quota');
          if(insufficientInfo) {
            alert('오류: OpenAI 할당량이 부족합니다. 관리자에게 문의하세요.');
          } else {
            alert(`오류: ${response.status} ${text}`);
          }
        }catch{
          alert(`Error: ${response.status} - ${text}`);
        }
        setLoading(false);
        return;
      }
      const data: RecipeResult | ErrorResponse = await response.json();

      if ('error' in data) {
        alert(`Error: ${data.error}`);
      } else {
        setResult(data);
      }
    } catch (error) {
      alert('An unexpected error occurred.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  console.log('result', result);
  return (
    <>
      <h1>AI 요리사</h1>
      <input 
        type="text" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="요리 이름을 입력하세요"
      />
      <button onClick={handleGenerateRecipe} disabled={loading}>
        {loading ? '로딩중...' : '레시피 만들기'}  
      </button>
      <hr />
      {result && (
        <div>
          <h2>{result.title}</h2>
          {result.image_url && <img src={result.image_url} alt={result.title} style={{maxWidth: '300px'}} />}
          <pre>{result.recipe}</pre>
        </div>
      )}      
    </>
  )
}

export default App