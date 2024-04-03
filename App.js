import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './color';

const STORAGE_KEY = '@toDos';
const LAST_TODO = '@last';

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState({});
  const [completed, setCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  async function setLastTab() {
    await AsyncStorage.setItem(LAST_TODO, working ? 'work' : 'travel');
  }

  useEffect(() => {
    loadToDos();
  }, []);

  useEffect(() => {
    setLastTab();
  }, [working]);

  const travel = async () => {
    setWorking(false);
  };
  const work = async () => {
    setWorking(true);
  };

  const onChangeText = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    const tab = await AsyncStorage.getItem(LAST_TODO);
    const s = await AsyncStorage.getItem(STORAGE_KEY);

    setWorking(tab === 'work');
    setToDos(s ? JSON.parse(s) : {});
  };

  const addToDo = async () => {
    if (text === '') {
      return;
    }
    /*const newTodos = Object.assign({}, toDos, {
      [Date.now()]: { text, work: working },
    });*/
    const newTodos = {
      ...toDos,
      [Date.now()]: { text, working, completed },
    };
    setToDos(newTodos);
    await saveToDos(newTodos);
    setText('');
  };

  const deleteToDo = (key) => {
    Alert.alert('Delete To Do?', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: "I'm Sure",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
    return;
  };

  const completeTodo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key] = { ...newToDos[key], completed: !newToDos[key].completed };
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const editToDo = async (key) => {
    const newToDos = { ...toDos };
    Object.keys(newToDos).map((id) => {
      if (newToDos[id].isEditing) {
        newToDos[id].isEditing = false;
      }
    });
    newToDos[key].isEditing = true;
    setEditText(newToDos[key].text);
    setToDos(newToDos);
  };

  const onChangeToDoText = (payload) => {
    setEditText(payload);
  };

  const onSubmitEditing = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key] = {
      ...newToDos[key],
      text: editText,
      isEditing: false,
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditText('');
  };

  const onCancelEdit = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].isEditing = false;
    setToDos(newToDos);
    setEditText('');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? 'white' : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? 'white' : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyType="done"
          value={text}
          placeholder={working ? 'Add a To Do' : 'Where do you want to go?'}
          style={styles.input}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View key={key} style={styles.toDo}>
              {toDos[key].isEditing ? (
                <TextInput
                  onSubmitEditing={() => onSubmitEditing(key)}
                  onChangeText={onChangeToDoText}
                  returnKeyType="done"
                  value={editText}
                  autoFocus={true}
                  onBlur={() => onCancelEdit(key)}
                  style={styles.toDoInput}
                />
              ) : (
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: toDos[key].completed
                      ? 'line-through'
                      : 'none',
                  }}
                >
                  {toDos[key].text}
                </Text>
              )}
              <View style={styles.toDoIcons}>
                <TouchableOpacity onPress={() => editToDo(key)}>
                  <Text>
                    <AntDesign name="edit" size={18} color={theme.toDoBg} />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => completeTodo(key)}>
                  <Text>
                    <MaterialCommunityIcons
                      name={
                        toDos[key].completed
                          ? 'checkbox-marked'
                          : 'checkbox-blank-outline'
                      }
                      size={24}
                      color={theme.toDoBg}
                    />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Text>
                    <FontAwesome name="trash" size={18} color={theme.toDoBg} />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 44,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toDoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  toDoIcons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  toDoInput: {
    fontSize: 17,
    fontWeight: '500',
  },
});
