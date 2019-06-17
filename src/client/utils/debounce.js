export default (fn, ms) => {
  let timeout;

  return function() {
    const call = () => fn.apply(this, arguments);

    clearTimeout(timeout);
    timeout = setTimeout(call, ms);
  }
}