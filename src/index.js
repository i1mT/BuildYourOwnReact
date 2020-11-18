/** @jsx Didact.createElement */
import Didact from './Didact'


const element = (<div>
  <p onClick={() => {
    console.log(111)
  }}>
    asdasdas
    <br />
    Hello
    <span style={{ color: 'red' }}>345</span>
  </p>
</div>)


const root = document.getElementById('root')
Didact.render(element, root)