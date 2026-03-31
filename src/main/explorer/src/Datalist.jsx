const Datalist = ({ inputRef, list, ...config }) => {
  const options = [];
  list.forEach(i => options.push(<option value={`subsystem/${i}`} />));

  return (
    <>
      <input ref={inputRef} {...config} list="subsystems" />
      <datalist id="subsystems">
        { options }
      </datalist>
    </>
  )
}

export default Datalist