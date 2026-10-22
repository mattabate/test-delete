import streamlit as st
st.title('rc1328-qa failing dashboard')
st.write(probe if 'probe' in globals() else 'no data')
